import { ExportedConfigWithProps, IOSConfig, XcodeProject, } from "@expo/config-plugins"
import fs from "fs"
import fsExtra from "fs-extra"
import path from "path"
import { ExpoConfig } from "@expo/config-types"
import { WithExpoIOSWidgetsProps } from ".."
import { addWidgetExtensionTarget } from "./xcode/addWidgetExtensionTarget"
import { Logging } from "../utils/logger"

export const getDefaultBuildConfigurationSettings = (options: WithExpoIOSWidgetsProps, config: ExpoConfig) => {
  const targetName = getTargetName(config, options)
  const deploymentTarget = options.deploymentTarget
  const developmentTeamId = options.devTeamId
  const bundleIdentifier = getBundleIdentifier(config, options)
  const currentProjectVersion = config.ios?.buildNumber || '1'
  const marketingVersion = config.version || '1.0'

  return {
    ALWAYS_SEARCH_USER_PATHS: 'NO',
    ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES: 'YES',
    ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME: "AccentColor",
    ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME: "WidgetBackground",
    CLANG_ANALYZER_NONNULL: "YES",
    CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
    //CLANG_CXX_LANGUAGE_STANDARD: '"gnu++20"',
    CLANG_ENABLE_OBJC_WEAK: "YES",
    CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
    //CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
    CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
    CODE_SIGN_STYLE: "Automatic",
    CODE_SIGN_ENTITLEMENTS: `${targetName}/${targetName}.entitlements`,
    CURRENT_PROJECT_VERSION: `${currentProjectVersion}`,
    DEBUG_INFORMATION_FORMAT: "dwarf",
    DEVELOPMENT_TEAM: `${developmentTeamId}`,
    GCC_C_LANGUAGE_STANDARD: "gnu11",
    GENERATE_INFOPLIST_FILE: "YES",
    INFOPLIST_FILE: `${targetName}/Info.plist`,
    INFOPLIST_KEY_CFBundleDisplayName: targetName,
    INFOPLIST_KEY_NSHumanReadableCopyright: '""',
    IPHONEOS_DEPLOYMENT_TARGET: `${deploymentTarget}`,
    LD_RUNPATH_SEARCH_PATHS:
      '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"',
    MARKETING_VERSION: `${marketingVersion}`,
    MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE",
    MTL_FAST_MATH: "YES",
    PRODUCT_NAME: '"$(TARGET_NAME)"',
    PRODUCT_BUNDLE_IDENTIFIER: `${bundleIdentifier}`,
    SKIP_INSTALL: "NO",
    SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG",
    SWIFT_EMIT_LOC_STRINGS: "YES",
    SWIFT_OPTIMIZATION_LEVEL: "-Onone",
    SWIFT_VERSION:  "5.4",
    TARGETED_DEVICE_FAMILY: '"1,2"',
    ...(options.xcode?.configOverrides || {}),
  }
}

/**
 * Gets the target name either via a sanitised config.name + Widgets or if provided options.xcode.targetName
 * @param config The expo config
 * @param options The ios config options
 * @returns The target name
 */
export const getTargetName = (config: ExpoConfig, options: WithExpoIOSWidgetsProps) => {
  if (options.targetName) {
    return IOSConfig.XcodeUtils.sanitizedName(options.targetName)
  }

  const cleanName = IOSConfig.XcodeUtils.sanitizedName(config.name)
  return `${cleanName}WidgetExtension`;
}

export const getBundleIdentifier = (config: ExpoConfig, options: WithExpoIOSWidgetsProps) => {
  if (options.xcode?.widgetBundleIdentifier) {
    return options.xcode.widgetBundleIdentifier
  }

  const targetName = getTargetName(config, options);
  return `${config.ios?.bundleIdentifier}.${targetName}`;
}

type WidgetProjectFiles = { [key: string]: string[] }

class WidgetProjectFileCollection {
  private readonly _files: WidgetProjectFiles

  constructor() {
    this._files = {
      swift: [],
      entitlements: [],
      plist: [],
      xcassets: [],
    };
  }

  static fromFiles(files: string[]) {
    const collection = new WidgetProjectFileCollection();
    collection.addFiles(files);

    return collection;
  }

  addFiles(files: string[]) {
    for (const file of files) {
      this.addFile(file);
    }
  }

  addFile(file: string) {
    const extension = path.extname(file).substring(1)

    if (file === "Module.swift") {
      return;
    }
    else if (this._files.hasOwnProperty(extension)) {
      Logging.logger.debug(`Adding file ${file}...`)
      Logging.logger.debug(`Extension: ${extension}`)

      this._files[extension].push(file)
    }
  }

  getFiltered() {
    return this._files
  }

  getBundled(includeProjectLevelFiles: boolean = false) {
    return Object.keys(this._files)
      .map(key => { return { files: this._files[key], key } })
      .reduce<string[]>((arr, { key, files }) => {
        if (!includeProjectLevelFiles && key === 'entitlements') {
          return arr;
        }

        return [...arr, ...files]
      }, []);
  }
}

const copyFilesToWidgetProject = (widgetFolderPath: string, targetPath: string) => {
  if (!fsExtra.lstatSync(widgetFolderPath).isDirectory()) {
    throw new Error(`The provided iOS src is not a directory. This value must be the directory of your widget files.`)
  }

  if (!fsExtra.existsSync(targetPath)) {
    Logging.logger.debug(`Creating widget extension directory ${targetPath}`)
    fsExtra.mkdirSync(targetPath, { recursive: true });
  }

  fsExtra.copySync(widgetFolderPath, targetPath, {
    filter: (name) => {
      const fileName = path.basename(name)
      if (name.endsWith('Module.swift') || fileName.startsWith('.')) {
        return false
      }
      Logging.logger.debug(`Copying ${name}`)

      return true
    }
  })
}

const copyModuleDependencies = (options: WithExpoIOSWidgetsProps, widgetFolderPath: string) => {
  const iosFolder = path.join(__dirname, '../../../ios')

  if (!options.moduleDependencies) {
    return
  }

  for (const dep of options.moduleDependencies) {
    const filePath = path.join(widgetFolderPath, dep)
    const destination = path.join(iosFolder, path.basename(dep))
    Logging.logger.debug(`Copying ${filePath} to ${destination}`)
    fsExtra.copyFileSync(filePath, destination)
  }
}

export const withWidgetXCode = (
  props: ExportedConfigWithProps<XcodeProject>,
  options: WithExpoIOSWidgetsProps,
) => {
  try {
    const {
      projectName,
      projectRoot,
      platformProjectRoot,
    } = props.modRequest

    const widgetFolderPath = path.join(projectRoot, options.src)
    const project = props.modResults;
    const targetUuid = project.generateUuid();

    const targetName = getTargetName(props, options)
    const targetPath = path.join(platformProjectRoot, targetName)

    // copy widget files over
    copyFilesToWidgetProject(widgetFolderPath, targetPath)
    copyModuleDependencies(options, widgetFolderPath)

    addFilesToWidgetProject(project, { widgetFolderPath, targetUuid, targetName, projectName: projectName || 'MyProject', expoConfig: props, options });

    return props
  } catch (e) {
    console.error(e)
    throw e
  }
}

const addFilesToWidgetProject = (
  project: XcodeProject,
  {
    widgetFolderPath,
    targetUuid,
    targetName,
    projectName,
    expoConfig,
    options,
  }: {
    targetUuid: string
    widgetFolderPath: string
    projectName: string
    targetName: string
    expoConfig: ExpoConfig
    options: WithExpoIOSWidgetsProps
  }) => {

  const iterateFiles = (relativePath: string, isBaseDirectory: boolean, parentGroup: any, widgetTargetUuid: string) => {
    const directory = path.join(widgetFolderPath, relativePath)
    const folderName = relativePath.split(/[\\\/]/).at(-1)
    const fileCollection = WidgetProjectFileCollection.fromFiles([])

    Logging.logger.debug(`Reading directory:: ${directory}`)
    Logging.logger.debug(`Relative path is:: ${relativePath}`)
    Logging.logger.debug(`Folder name:: ${folderName}`)
    const items = fs.readdirSync(directory)

    let directoriesToIterate: string[] = []

    for (const item of items) {
      const fullPath = path.join(directory, item)
      const itemRelPath = path.join(relativePath, item)

      if (item === 'Assets.xcassets') {
        fileCollection.addFile(item)
      }
      else if (fsExtra.lstatSync(fullPath).isDirectory()) {
        directoriesToIterate.push(itemRelPath)
      }
      else {
        fileCollection.addFile(item)
      }
    }

    // all files for current directory now in collection, time to add them to xcode proj
    const filesByType = fileCollection.getFiltered()
    const allFiles = fileCollection.getBundled();

    Logging.logger.debug(`Item count: ${items.length}`)
    Logging.logger.debug(`Adding ${filesByType.swift.length} swift files...`)
    Logging.logger.debug(`Adding ${filesByType.xcassets.length} asset files...`)

    Logging.logger.debug(`Creating PBX group for the widget project:: ${targetName}`)
    // for each level of files in the directory add a new group, and then add this group to the parent directory

    Logging.logger.debug(`Adding ${allFiles.length} files...`)

    const groupTarget = isBaseDirectory ? targetName : folderName
    const groupPath = isBaseDirectory ? targetName : relativePath

    const pbxGroup = project.addPbxGroup(
      [...allFiles, `${targetName}.entitlements`, `Info.plist`],
      groupTarget, // name 
      groupPath, // the path is the folder name. For top level files this is the project name.
      '"<group>"'
    )

    if (isBaseDirectory) {
      // add to top project (main) group
      const projectInfo = project.getFirstProject()
      //Logging.logger.debug(projectInfo)
      const mainGroup = projectInfo.firstProject.mainGroup
      Logging.logger.debug(`Adding new group to main group: ${mainGroup}`)

      project.addToPbxGroup(pbxGroup.uuid, mainGroup)

      Logging.logger.debug(`Adding build phase for PBXSourcesBuildPhase ${groupTarget} to widget target ${widgetTargetUuid}`)

      project.addBuildPhase(
        filesByType.swift,
        "PBXSourcesBuildPhase",
        groupName,
        widgetTargetUuid,
        "app_extension", // folder type
        "", // build path 
      )

      Logging.logger.debug(`Adding PBXCopyFilesBuildPhase to project ${project.getFirstTarget().uuid}`)
      project.addBuildPhase(
        [],
        'PBXCopyFilesBuildPhase',
        groupName,
        project.getFirstTarget().uuid,
        'app_extension',
        ''
      )

      if (filesByType.xcassets?.length) {
        Logging.logger.debug(`Adding PBXResourcesBuildPhase to target ${widgetTargetUuid}`)
        project.addBuildPhase(
          filesByType.xcassets,
          "PBXResourcesBuildPhase",
          groupName,
          widgetTargetUuid,
          "app_extension",
          "",
        )
      }
      else {
        console.warn('No asset files detected')
      }
    }
    else {
      // add to parent pbx group
      project.addToPbxGroup(pbxGroup.uuid, parentGroup.uuid)
    }

    if (filesByType.xcassets) {
      for (const assetFile of filesByType.xcassets) {
        Logging.logger.debug(`Adding asset file:: ${assetFile} to target ${targetUuid}`)

        project.addResourceFile(assetFile, {
          target: targetUuid,

        })
      }
    }

    for (const d of directoriesToIterate) {
      iterateFiles(d, false, pbxGroup, widgetTargetUuid)
    }
  }

  project.getFirstProject().firstProject.compatibilityVersion = '"Xcode 14.0"'

  const groupName = "Embed Foundation Extensions"

  const nativeTargets = project.pbxNativeTargetSection()
  let projectTarget: { uuid: string, pbxNativeTarget: any } | null = null;

  for (const uuid in nativeTargets) {
    const pbxNativeTarget = nativeTargets[uuid]

    if (pbxNativeTarget.name === projectName) {
      projectTarget = {
        uuid,
        pbxNativeTarget,
      };
      break
    }
  }

  Logging.logger.debug(projectTarget)

  if (!projectTarget) {
    Logging.logger.debug(`No project target! Adding...`)
    projectTarget = project.addTarget(projectName, 'application', '')
    Logging.logger.debug(projectTarget)
  }

  //const widgetsTarget = project.addTarget(targetName, 'application', '')
  //const extensionTarget = project.addTarget(`${targetName}Extension`, 'app_extension', '')
  Logging.logger.debug(`Adding extension target`)
  const extensionTarget = addWidgetExtensionTarget(project, expoConfig, options, `${targetName}`)

  const getPBXTargetByName = (project: XcodeProject, name: string) => {
    var targetSection = project.pbxNativeTargetSection()

    for (const uuid in targetSection) {
        const target = targetSection[uuid]
        
        if (target.name === name) {
            return {
                uuid,
                target,
            }
        }    
    }

    return { target: null, uuid: null }
}

  Logging.logger.debug(`Adding project target ${projectTarget?.uuid} to extension target ${extensionTarget.uuid}`)

  const projectObjects = project.hash.project.objects
  const dodgyKeys = ["PBXTargetDependency", "PBXContainerItemProxy"]

  for (const key of dodgyKeys) {
    Logging.logger.debug(`Fixing key ${key}`)
    if (!projectObjects[key]) {
      projectObjects[key] = {};
    }
  }

  const projectSectionItem = project.pbxProjectSection()[project.getFirstProject().uuid]

  if (!projectSectionItem.attributes.TargetAttributes) {
    projectSectionItem.attributes.TargetAttributes = {}
  }

  projectSectionItem.attributes.TargetAttributes[extensionTarget.uuid] = {
    LastSwiftMigration: 1250
  }

  project.addTargetDependency(projectTarget?.uuid, [extensionTarget.uuid])

  // this does everything incl adding to frameworks pbx group
  addFrameworksToWidgetProject(project, extensionTarget);

  const pbxProjectSection = project.pbxProjectSection();

  const projectUuid = Object.keys(pbxProjectSection)
    .filter(id => id.indexOf('comment') === -1)
  [0];

  Logging.logger.debug('proj section uuid::' + projectUuid)

  iterateFiles('', true, undefined, extensionTarget.uuid)

  return {
    extensionTarget,
  }
}


const addFrameworksToWidgetProject = (project: XcodeProject, target: { uuid: string }) => {
  const frameworks = ['WidgetKit.framework', 'SwiftUI.framework']

  for (const framework of frameworks) {
    project.addFramework(framework, {
      target: target.uuid,
      link: true,
    })
  }

  project.addBuildPhase(
    frameworks,
    'PBXFrameworksBuildPhase',
    'Frameworks',
    target.uuid
  )
}

// export const getXCodeBuildConfiguration = (project: XcodeProject, config: ExpoConfig, options: WithExpoIOSWidgetsProps, targetName: string) => {
//   const settings = getDefaultBuildConfigurationSettings({
//     targetName: getTargetName(config, options),
//     deploymentTarget: options.deploymentTarget,
//     developmentTeamId: options.devTeamId,
//     bundleIdentifier: getBundleIdentifier(config, options),
//     currentProjectVersion: config.ios?.buildNumber || '1',
//     marketingVersion: config.version || '1.0',
//   });

//   return [
//     {
//       name: "Debug",
//       isa: "XCBuildConfiguration",
//       buildSettings: {
//         ...settings,
//       } 
//     },
//     {
//       name: "Release",
//       isa: "XCBuildConfiguration",
//       buildSettings: {
//         ...settings,
//       }
//     }
//   ]
// }
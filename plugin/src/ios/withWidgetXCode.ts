import { ConfigPlugin, IOSConfig, Mod, withXcodeProject, XcodeProject, } from "@expo/config-plugins"
import fs from "fs"
import fsExtra from "fs-extra"
import path from "path"
import { ExpoConfig } from "@expo/config-types"
import { WithExpoIOSWidgetsProps } from ".."
import * as util from "util"
import { addWidgetExtensionTarget } from "./xcode/addWidgetExtensionTarget"

export const getDefaultBuildConfigurationSettings = ({
  targetName,
  currentProjectVersion = '1',
  deploymentTarget = '16.4',
  bundleIdentifier,
  developmentTeamId,
  marketingVersion,
}: {
  targetName: string, 
  currentProjectVersion: string,
  deploymentTarget: string,
  bundleIdentifier: string,
  developmentTeamId: string,
  marketingVersion: string,
}) => {
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
    CURRENT_PROJECT_VERSION: `${currentProjectVersion}`,
    DEBUG_INFORMATION_FORMAT: "dwarf",
    DEVELOPMENT_TEAM: `${developmentTeamId}`,
    GCC_C_LANGUAGE_STANDARD: "gnu11",
    GENERATE_INFOPLIST_FILE: "YES",
    INFOPLIST_FILE: `${targetName}/Info.plist`,
    INFOPLIST_KEY_CFBundleDisplayName: targetName,
    INFOPLIST_KEY_NSHumanReadableCopyright: '""',
    IPHONEOS_DEPLOYMENT_TARGET:`${deploymentTarget}`,
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
    SWIFT_VERSION: "5.2",
    TARGETED_DEVICE_FAMILY: '"1,2"',
  }
}

/**
 * Gets the target name either via a sanitised config.name + Widgets or if provided options.xcode.targetName
 * @param config The expo config
 * @param options The ios config options
 * @returns The target name
 */
export const getTargetName = (config: ExpoConfig, options: WithExpoIOSWidgetsProps) => {
  if (options.xcode?.targetName) {
    return IOSConfig.XcodeUtils.sanitizedName(options.xcode.targetName)
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
  private readonly  _files: WidgetProjectFiles

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
    else 
    if (this._files.hasOwnProperty(extension)) {
      console.log(`Adding file ${file}...`)
      console.log(`Extension: ${extension}`)

      this._files[extension].push(file)
    }
  }

  getFiltered() {
    return this._files
  }

  getBundled(includeProjectLevelFiles: boolean = false) {
    return Object.keys(this._files)
      .map(key => { return { files: this._files[key], key }})
      .reduce<string[]>((arr, { key, files }) => {
        if (!includeProjectLevelFiles && key === 'entitlements') {
          return arr;
        }

        return [ ...arr, ...files ]
      }, []);
  }
}

const copyFilesToWidgetProject = (widgetFolderPath: string, targetPath: string, projectPath: string, platformProjectRoot: string) => {
  if (!fsExtra.lstatSync(widgetFolderPath).isDirectory()) {
    throw new Error(`The provided iOS src is not a directory. This value must be the directory of your widget files.`)
  }

  if (!fsExtra.existsSync(targetPath)) {
    console.log(`Creating widget extension directory ${targetPath}`)
    fsExtra.mkdirSync(targetPath, { recursive: true });
  }

  if (!fsExtra.existsSync(projectPath)) {
    console.log(`Creating project directory`)
    fsExtra.mkdirSync(projectPath, { recursive: true });
  }

  const moduleFile = path.join(widgetFolderPath, 'Module.swift')
  
  if (!fs.existsSync(moduleFile)) {
    throw new Error(`Module.swift does not exist in ${widgetFolderPath}. You must add a Module.swift file. See READ_ME for more information.`)
  }

  fsExtra.copySync(widgetFolderPath, targetPath, {
    filter: (name) => {
      const fileName = path.basename(name)
      if (name.endsWith('Module.swift') || fileName.startsWith('.')) {        
        return false
      }
      console.log(`Copying ${name}`)

      return true
    }
  })

  console.log(`Copying ${moduleFile} to ${platformProjectRoot}`)
  fsExtra.copyFileSync(moduleFile, path.join(platformProjectRoot, path.basename(moduleFile)))
}

export const withWidgetXCode: ConfigPlugin<WithExpoIOSWidgetsProps> = (
  config,
  options,
) => {
  return withXcodeProject(config, (props) => {
    try {
      const {
        projectName,
        projectRoot,
        platformProjectRoot,
      } = props.modRequest

      const widgetFolderPath = path.join(projectRoot, options.src)
      const project = props.modResults;
      const targetUuid = project.generateUuid();

      const targetName = getTargetName(config, options)
      const targetPath = path.join(platformProjectRoot, targetName)
      const projectPath = path.join(platformProjectRoot, IOSConfig.XcodeUtils.sanitizedName(config.name))

      // copy widget files over
      copyFilesToWidgetProject(widgetFolderPath, targetPath, projectPath, platformProjectRoot)

      const { extensionTarget, } = addFilesToWidgetProject(project, { widgetFolderPath, targetUuid, targetName, projectName: projectName || 'MyProject', expoConfig: config, options });

      // these can be overridden in app.json / plugin / expo-widget / ios / xcode / settings
      //const buildConfigurationList = getXCodeBuildConfiguration(project, config, options, targetName);

      // const configurations = project.pbxXCConfigurationList()

      // console.log(`Searching for extension target BCL ${extensionTarget.pbxNativeTarget.buildConfigurationList}`)

      // console.log(configurations)

      // for (const key in configurations) {
      //   if (key !== extensionTarget.pbxNativeTarget.buildConfigurationList) continue

      //   console.log(`Configuration found`)
      //   console.log(configurations[key])
      //   const configs = configurations[key].buildConfigurations
      //   const section = project.pbxXCBuildConfigurationSection()

      //   console.log('configs::')
      //   console.log(configs)

      //   for (const { value, comment } of configs) {
      //     const config = section[value]
      //     const nameMatch = buildConfigurationList.find(n => n.name === comment)
      //     console.log(config)

      //     if (nameMatch) {
      //       console.log(`Name match ${comment} found. Updating build settings.`)
            
      //       config.buildSettings = {
      //         ...config.buildSettings,
      //         ...nameMatch.buildSettings
      //       }
      //     }
      //   }   
        
      //   // fix swift version TODO must be configurable
      //   for (const bcId in section) {
      //     const buildConfig = section[bcId]

      //     if (!!buildConfig?.buildSettings) {
      //       buildConfig.buildSettings = {
      //         ...buildConfig.buildSettings,
      //         SWIFT_VERSION: '5.2'
      //       }
      //     }          
      //   }
      // }
  
      return props
    } catch (e) {
      console.error(e)
      throw e
    }
  })
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
  //const files = fs.readdirSync(widgetFolderPath)

  const iterateFiles = (relativePath: string, isBaseDirectory: boolean, parentGroup: any, widgetTargetUuid: string) => {
    const directory = path.join(widgetFolderPath, relativePath)
    const folderName = relativePath.split(/[\\\/]/).at(-1)
    const fileCollection = WidgetProjectFileCollection.fromFiles([])

    console.log(`Reading directory:: ${directory}`)
    console.log(`Relative path is:: ${relativePath}`)
    console.log(`Folder name:: ${folderName}`)
    const items = fs.readdirSync(directory)

    let directoriesToIterate: string[] = []
    
    for (const item of items) {
      const fullPath = path.join(directory, item)
      const itemRelPath = path.join(relativePath, item)
      
      if (item === 'Assets.xcassets') {
        continue
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
    
    console.log(`Item count: ${items.length}`)
    console.log(`Adding ${filesByType.swift.length} swift files...`)
    console.log(`Adding ${filesByType.xcassets.length} asset files...`)

    console.log(`Creating PBX group for the widget project:: ${targetName}`)
    // for each level of files in the directory add a new group, and then add this group to the parent directory
  
    console.log(`Adding ${allFiles.length} files...`)

    const groupTarget = isBaseDirectory ? targetName : folderName
    const groupPath = isBaseDirectory ? targetName : relativePath
    
    const pbxGroup = project.addPbxGroup(
      allFiles,
      groupTarget, // name 
      groupPath, // the path is the folder name. For top level files this is the project name.
      '"<group>"'
    )

    if (isBaseDirectory) {
      // add to top project (main) group
      const projectInfo = project.getFirstProject()
      //console.log(projectInfo)
      const mainGroup = projectInfo.firstProject.mainGroup
      console.log(`Adding new group to main group: ${mainGroup}`)

      project.addToPbxGroup(pbxGroup.uuid, mainGroup)

      // entitlement files should only be at the top level
      if (filesByType.entitlements?.length) {
        // CE8935AB2A5E98B900A4B0E2 /* TestWidgetExtension.entitlements */ = {isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = TestWidgetExtension.entitlements; sourceTree = "<group>"; };
        for (const file of filesByType.entitlements) {
          console.log(`Adding entitlement file ${file}`)
    
          const newFile = project.addFile(file, mainGroup, {
            lastKnownFileType: 'text.plist.entitlements',
            sourceTree: '"<group>"',
          })
        }    
      }
      else {
        console.log(`No entitlements files`)
      }

      console.log(`Adding build phase for PBXSourcesBuildPhase ${groupTarget} to widget target ${widgetTargetUuid}`)

      project.addBuildPhase(
        filesByType.swift,
        "PBXSourcesBuildPhase",
        groupName,
        widgetTargetUuid,
        "app_extension", // folder type
        "", // build path 
      )

      console.log(`Adding PBXCopyFilesBuildPhase to project ${projectInfo.firstProject.uuid}`)
      project.addBuildPhase(
        [],
        'PBXCopyFilesBuildPhase',
        groupName,
        projectInfo.firstProject.uuid,
        'app_extension',
        ''
      )

      // project.buildPhaseObject('PBXCopyFilesBuildPhase', groupName, widgetTargetUuid)
      //   .files
      //   .push({
      //     value: widgetTargetUuid,
      //     comment: util.format('%s in %s', '' groupName)
      //   })

      if (filesByType.xcassets?.length) {
        console.log(`Adding PBXResourcesBuildPhase to target ${widgetTargetUuid}`)
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

    //console.log(project.hash.project.objects['PBXGroup'])
  
    if (filesByType.xcassets) {
      for (const assetFile of filesByType.xcassets) {
        console.log(`Adding asset file:: ${assetFile} to target ${targetUuid}`)
  
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

  console.log(projectTarget)

  if (!projectTarget) {
    console.log(`No project target! Adding...`)
    projectTarget = project.addTarget(projectName, 'application', '')
    console.log(projectTarget)
  }

  //const widgetsTarget = project.addTarget(targetName, 'application', '')
  //const extensionTarget = project.addTarget(`${targetName}Extension`, 'app_extension', '')
  console.log(`Adding extension target`)
  const extensionTarget = addWidgetExtensionTarget(project, expoConfig, options, `${targetName}`)

  console.log(`Adding project target ${projectTarget?.uuid} to extension target ${extensionTarget.uuid}`)

  const projectObjects = project.hash.project.objects
  const dodgyKeys = [ "PBXTargetDependency", "PBXContainerItemProxy" ]
  
  for (const key of dodgyKeys) {
    console.log(`Fixing key ${key}`)
    if (!projectObjects[key]) {
      projectObjects[key] = {};
    }
  }

  const projectSectionItem = project.pbxProjectSection()[project.getFirstProject().uuid]

  if (!projectSectionItem.attributes.TargetAttributes) {
    projectSectionItem.attributes.TargetAttributes = {}
  }

  projectSectionItem.attributes.TargetAttributes[ extensionTarget.uuid ] = {
    LastSwiftMigration: 1250
  }

  project.addTargetDependency(projectTarget?.uuid, [ extensionTarget.uuid ])

  // this does everything incl adding to frameworks pbx group
  addFrameworksToWidgetProject(project, extensionTarget);

  const pbxProjectSection = project.pbxProjectSection();

  const projectUuid = Object.keys(pbxProjectSection)
    .filter(id => id.indexOf('comment') === -1)
    [0];

  console.log('proj section uuid::' + projectUuid)

  iterateFiles('', true, undefined, extensionTarget.uuid)

  return {
    extensionTarget,
  }
}


const addFrameworksToWidgetProject = (project: XcodeProject, target: { uuid: string }) => {
  project.addFramework('WidgetKit.framework', {
    target: target.uuid,
    link: true,
  })
  project.addFramework('SwiftUI.framework', {
    target: target.uuid,
    link: true,
  })
}

export const getXCodeBuildConfiguration = (project: XcodeProject, config: ExpoConfig, options: WithExpoIOSWidgetsProps, targetName: string) => {
  const settings = getDefaultBuildConfigurationSettings({
    targetName: getTargetName(config, options),
    deploymentTarget: options.deploymentTarget,
    developmentTeamId: options.devTeamId,
    bundleIdentifier: getBundleIdentifier(config, options),
    currentProjectVersion: config.ios?.buildNumber || '1',
    marketingVersion: config.version || '1.0',
  });

  return [
    {
      name: "Debug",
      isa: "XCBuildConfiguration",
      buildSettings: {
        ...settings,
      } 
    },
    {
      name: "Release",
      isa: "XCBuildConfiguration",
      buildSettings: {
        ...settings,
      }
    }
  ]
}
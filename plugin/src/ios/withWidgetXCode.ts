import { ExportedConfigWithProps, IOSConfig, XcodeProject, } from "@expo/config-plugins"
import fs from "fs"
import fsExtra from "fs-extra"
import path from "path"
import { ExpoConfig } from "@expo/config-types"
import { WithExpoIOSWidgetsProps } from ".."
import { addWidgetExtensionTarget } from "./xcode/addWidgetExtensionTarget"
import { Logging } from "../utils/logger"
import { WidgetProjectFileCollection } from "./widgetProjectFileCollection"
import { addFrameworksToWidgetProject } from "./xcode/framework"
import { getTargetName } from "./xcode/target"

export const getBundleIdentifier = (config: ExpoConfig, options: WithExpoIOSWidgetsProps) => {
  if (options.xcode?.widgetBundleIdentifier) {
    return options.xcode.widgetBundleIdentifier
  }

  const targetName = getTargetName(config, options);
  return `${config.ios?.bundleIdentifier}.${targetName}`;
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
    const iosProjectPath = IOSConfig.Paths.getSourceRoot(projectRoot)

    // copy widget files over
    copyFilesToWidgetProject(widgetFolderPath, targetPath)
    copyModuleDependencies(options, widgetFolderPath)

    addFilesToWidgetProject(project, { widgetFolderPath, iosProjectPath, targetUuid, targetName, projectName: projectName || 'MyProject', expoConfig: props, options });

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
    iosProjectPath,
    targetUuid,
    targetName,
    projectName,
    expoConfig,
    options,
  }: {
    targetUuid: string
    widgetFolderPath: string
    iosProjectPath: string
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
    Logging.logger.debug(`Adding ${allFiles.length} files...`)

    // for each level of files in the directory add a new group, 
    // and then add this group to the parent directory
    const groupTarget = isBaseDirectory ? targetName : folderName
    const groupPath = isBaseDirectory ? targetName : relativePath

    const pbxGroup = project.addPbxGroup(
      [...allFiles, `${targetName}.entitlements`, `Info.plist`],
      groupTarget, // name 
      groupPath, // the path is the folder name. For top level files this is the project name.
      '"<group>"'
    )

    const shouldAddResourcesBuildPhase = () => {
      const googleServicePlistPath = path.join(iosProjectPath, 'GoogleService-Info.plist');
      return fs.existsSync(googleServicePlistPath) || filesByType.xcassets?.length > 0;
    }

    const getResourceFiles = () => {
      const resources = [...(filesByType.xcassets || [])];
      const googleServicePlistPath = path.join(iosProjectPath, 'GoogleService-Info.plist');
      
      if (fs.existsSync(googleServicePlistPath)) {
        resources.push(googleServicePlistPath);
      }
      
      return resources;
    }

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

      if (shouldAddResourcesBuildPhase()) {
        Logging.logger.debug(`Adding PBXResourcesBuildPhase to target ${widgetTargetUuid}`);
        project.addBuildPhase(
          getResourceFiles(),
          "PBXResourcesBuildPhase",
          groupName,
          widgetTargetUuid,
          "app_extension",
          "",
        );
      } else {
        Logging.logger.debug('No asset or GoogleService-Info.plist files detected');
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

  Logging.logger.debug(`Adding extension target`)
  const extensionTarget = addWidgetExtensionTarget(project, expoConfig, options, `${targetName}`)

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
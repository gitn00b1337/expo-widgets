import { ExportedConfigWithProps, IOSConfig, XcodeProject, withDangerousMod } from "@expo/config-plugins";
import path from "path"
import { getBundleIdentifier, getDefaultBuildConfigurationSettings, getTargetName } from "../withWidgetXCode";
import { WithExpoIOSWidgetsProps } from "../..";
import { ExpoConfig } from "@expo/config-types"
import * as util from "util"
import { Logging } from "../../utils/logger"
import fsExtra from "fs-extra"
import { config } from "process";
import * as fs from 'fs';
import { getAppGroupEntitlement } from "../withConfig";

const createEntitlementXML = (appGroupId: string, mode: 'development' | 'production') => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>aps-environment</key>
    <string>${mode}</string>
	<key>com.apple.security.application-groups</key>
	<array>
		<string>${appGroupId}</string>
	</array>
</dict>
</plist>`

export const withAppGroupEntitlements = (config: ExportedConfigWithProps<unknown>, options: WithExpoIOSWidgetsProps) => {

  if (options.xcode?.generateAppGroup === false) {
    Logging.logger.debug('App group generation skipped.')
    return
}

//   return withDangerousMod(config, [
//     'ios',
//     async config => {
        const {
            projectName,
            projectRoot,
            platformProjectRoot,
        } = config.modRequest

        // this is /example
        Logging.logger.debug(`Project root:: ${projectRoot}`)
        const mainProjectName = projectName || ''
        const widgetProjectName = getTargetName(config, options)
        const entitlementsFileName = `${widgetProjectName}.entitlements`
        //Logging.logger.debug(`mainProjectName:: ${mainProjectName}`)
        Logging.logger.debug(`WidgetProjectName:: ${widgetProjectName}`)
    
        // firstly create an entitlements file in each project. if it exists, throw until implemented merging
        const appGroupId =  getAppGroupId(config, options)
        Logging.logger.debug(`AppGroupId:: ${appGroupId}`)
    
        //const mainProjectEntitlementFile = path.join(platformProjectRoot, entitlementsFileName)
        const widgetProjectPath = path.join(platformProjectRoot, widgetProjectName)
        const widgetProjectEntitlementFile = path.join(widgetProjectPath, `${widgetProjectName}.entitlements`)

        
        //Logging.logger.debug(`MainProjectEntitlement:: ${mainProjectEntitlementFile}`)
        // this is example/ios/expowidgetsWidgetExtension/expowidgetsWidgetExtension.entitlements
        Logging.logger.debug(`WidgetProjectEntitlementFile:: ${widgetProjectEntitlementFile}`)

        fs.mkdirSync(widgetProjectPath, { recursive: true })
    
        // fsExtra.writeFileSync(widgetProjectEntitlementFile, createEntitlementXML(appGroupId)) 
        fsExtra.writeFileSync(widgetProjectEntitlementFile, createEntitlementXML(appGroupId, options.mode || 'production'), {  })

        return config;
    //},
  //])
}
/*
 const {
        projectName,
        projectRoot,
        platformProjectRoot,
    } = props.modRequest

    if (options.xcode?.generateAppGroup === false) {
        Logging.logger.debug('App group generation skipped.')
        return
    }

    const mainProjectName = projectName || ''
    const widgetProjectName = getTargetName(config, options)
    const entitlementsFileName = `${widgetProjectName}.entitlements`
    //Logging.logger.debug(`mainProjectName:: ${mainProjectName}`)
   // Logging.logger.debug(`WidgetProjectName:: ${widgetProjectName}`)

    // firstly create an entitlements file in each project. if it exists, throw until implemented merging
    const appGroupId =  getAppGroupId(config, options)
    //Logging.logger.debug(`AppGroupId:: ${appGroupId}`)

    const mainProjectEntitlementFile = path.join(platformProjectRoot, entitlementsFileName)
    //const widgetProjectEntitlementFile = path.join(platformProjectRoot, widgetProjectName, `${widgetProjectName}.entitlements`)
    //Logging.logger.debug(`MainProjectEntitlement:: ${mainProjectEntitlementFile}`)
    //Logging.logger.debug(`WidgetProjectEntitlementFile:: ${widgetProjectEntitlementFile}`)

    fsExtra.writeFileSync(mainProjectEntitlementFile, createEntitlementXML(appGroupId), {  })
    //fsExtra.writeFileSync(widgetProjectEntitlementFile, createEntitlementXML(appGroupId))    

    //const projectInfo = project.getFirstProject()
      //Logging.logger.debug(projectInfo)
    //const mainGroup = projectInfo.firstProject.mainGroup

    // project.addFile(entitlementsFileName, mainGroup, {
    //   lastKnownFileType: 'text.plist.entitlements',
    //    sourceTree: '"<group>"',
    //    path: entitlementsFileName,
    //    isa: 'PBXFileReference'
    // })

*/
   

export const getAppGroupId = (config: ExpoConfig, options: WithExpoIOSWidgetsProps) => {
    if (options.xcode?.appGroupId) {
        return options.xcode?.appGroupId
    }

    const projectName = IOSConfig.XcodeUtils.sanitizedName(config.name)

    if (config.ios?.bundleIdentifier) {
        return `group.${config.ios?.bundleIdentifier}.${projectName}`
    }
    else {
        throw new Error(`Cannot generate application group. Either app.json/expo.ios.bundleIdentifier or pluginoptions/xcode.appGroupId must be set.`)
    }
}
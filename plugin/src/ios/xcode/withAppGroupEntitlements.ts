import { ExportedConfigWithProps, XcodeProject } from "@expo/config-plugins";
import path from "path"
import { getBundleIdentifier, getDefaultBuildConfigurationSettings, getTargetName } from "../withWidgetXCode";
import { WithExpoIOSWidgetsProps } from "../..";
import { ExpoConfig } from "@expo/config-types"
import * as util from "util"
import { Logging } from "../../utils/logger"
import fsExtra from "fs-extra"

const createEntitlementXML = (appGroupId: string) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.security.application-groups</key>
	<array>
		<string>${appGroupId}</string>
	</array>
</dict>
</plist>`

export const withAppGroupEntitlements = (project: XcodeProject, config: ExpoConfig, options: WithExpoIOSWidgetsProps, props: ExportedConfigWithProps<XcodeProject>) => {
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
    Logging.logger.debug(`mainProjectName:: ${mainProjectName}`)
   // Logging.logger.debug(`WidgetProjectName:: ${widgetProjectName}`)

    // firstly create an entitlements file in each project. if it exists, throw until implemented merging
    const appGroupId =  getAppGroupId(config, options)
    Logging.logger.debug(`AppGroupId:: ${appGroupId}`)

    const mainProjectEntitlementFile = path.join(platformProjectRoot, entitlementsFileName)
    //const widgetProjectEntitlementFile = path.join(platformProjectRoot, widgetProjectName, `${widgetProjectName}.entitlements`)
    //Logging.logger.debug(`MainProjectEntitlement:: ${mainProjectEntitlementFile}`)
    //Logging.logger.debug(`WidgetProjectEntitlementFile:: ${widgetProjectEntitlementFile}`)

    fsExtra.writeFileSync(mainProjectEntitlementFile, createEntitlementXML(appGroupId), {  })
    //fsExtra.writeFileSync(widgetProjectEntitlementFile, createEntitlementXML(appGroupId))    

    const projectInfo = project.getFirstProject()
      //Logging.logger.debug(projectInfo)
    const mainGroup = projectInfo.firstProject.mainGroup

    project.addFile(entitlementsFileName, mainGroup, {
      lastKnownFileType: 'text.plist.entitlements',
       sourceTree: '"<group>"',
       path: entitlementsFileName,
       isa: 'PBXFileReference'
    })
}

export const getAppGroupId = (config: ExpoConfig, options: WithExpoIOSWidgetsProps) => {
    if (options.xcode?.appGroupId) {
        return options.xcode?.appGroupId
    }

    if (config.ios?.bundleIdentifier) {
        return `${config.ios?.bundleIdentifier}.wgroup`
    }
    else {
        throw new Error(`Cannot generate application group - missing config.ios.bundleIdentifier.`)
    }
}
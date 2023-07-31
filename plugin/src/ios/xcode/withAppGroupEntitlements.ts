import { ExportedConfigWithProps, IOSConfig, } from "@expo/config-plugins";
import path from "path"
import { getTargetName } from "../withWidgetXCode";
import { WithExpoIOSWidgetsProps } from "../..";
import { ExpoConfig } from "@expo/config-types"
import { Logging } from "../../utils/logger"
import fsExtra from "fs-extra"
import * as fs from 'fs';

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
    const {
        projectName,
        projectRoot,
        platformProjectRoot,
    } = config.modRequest

    const widgetProjectName = getTargetName(config, options)

    const appGroupId = getAppGroupId(config, options)
    Logging.logger.debug(`AppGroupId:: ${appGroupId}`)

    const entitlementsFileName = `${widgetProjectName}.entitlements`
    const mainProjectEntitlementFile = path.join(platformProjectRoot, entitlementsFileName)
    const widgetProjectPath = path.join(platformProjectRoot, widgetProjectName)
    const widgetProjectEntitlementFile = path.join(widgetProjectPath, `${widgetProjectName}.entitlements`)

    Logging.logger.debug(`WidgetProjectEntitlementFile:: ${widgetProjectEntitlementFile}`)

    fs.mkdirSync(widgetProjectPath, { recursive: true })

    fsExtra.writeFileSync(widgetProjectEntitlementFile, createEntitlementXML(appGroupId, options.mode || 'production'))

    return config
}

export const getPushNotificationsMode = (options: WithExpoIOSWidgetsProps) => {
    return options.mode || 'production'
}

export const getAppGroupId = (config: ExpoConfig, options: WithExpoIOSWidgetsProps) => {
    if (options.xcode?.appGroupId) {
        return options.xcode?.appGroupId
    }

    const projectName = IOSConfig.XcodeUtils.sanitizedName(config.name)

    if (config.ios?.bundleIdentifier) {
        return `group.${config.ios?.bundleIdentifier}.expowidgets`
    }
    else {
        throw new Error(`Cannot generate application group. Either app.json/expo.ios.bundleIdentifier or pluginoptions/xcode.appGroupId must be set.`)
    }
}
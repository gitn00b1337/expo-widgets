import { ExportedConfigWithProps, IOSConfig, } from "@expo/config-plugins";
import path from "path"
import { getTargetName } from "../withWidgetXCode";
import { IOSEntitlements, WithExpoIOSWidgetsProps } from "../..";
import { ExpoConfig } from "@expo/config-types"
import { Logging } from "../../utils/logger"
import fsExtra from "fs-extra"
import * as fs from 'fs';
import * as plist from 'plist';

const createEntitlementXML = (appGroupId: string, mode: 'development' | 'production', entitlements?: IOSEntitlements) => {
    const finalEntitlements = {
        ...entitlements || {},
        'aps-environment': mode,
        'com.apple.security.application-groups': [ appGroupId ],
    }
    return plist.build(finalEntitlements)
}

export const withEntitlements = (config: ExportedConfigWithProps<unknown>, options: WithExpoIOSWidgetsProps) => {
    const {
        platformProjectRoot,
    } = config.modRequest

    const widgetProjectName = getTargetName(config, options)

    const appGroupId = getAppGroupId(config, options)
    Logging.logger.debug(`AppGroupId:: ${appGroupId}`)

    const widgetProjectPath = path.join(platformProjectRoot, widgetProjectName)
    const widgetProjectEntitlementFile = path.join(widgetProjectPath, `${widgetProjectName}.entitlements`)

    Logging.logger.debug(`WidgetProjectEntitlementFile:: ${widgetProjectEntitlementFile}`)

    fs.mkdirSync(widgetProjectPath, { recursive: true })

    fsExtra.writeFileSync(widgetProjectEntitlementFile, createEntitlementXML(appGroupId, options.mode || 'production', options.xcode?.entitlements))

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
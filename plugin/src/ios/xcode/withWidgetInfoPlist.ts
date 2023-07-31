

// EAS fails without the info.plist file updated in the widget extension project

import { ExportedConfigWithProps } from "@expo/config-plugins";
import { WithExpoIOSWidgetsProps } from "../..";
import path from "path";
import { getTargetName } from "../withWidgetXCode";
import fsExtra from "fs-extra"

const getPlistContents = (bundleVersion: string, shortVersion: string) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
        <key>CFBundleDevelopmentRegion</key>
        <string>$(DEVELOPMENT_LANGUAGE)</string>
        <key>CFBundleDisplayName</key>
        <string>OneSignalNotificationServiceExtension</string>
        <key>CFBundleExecutable</key>
        <string>$(EXECUTABLE_NAME)</string>
        <key>CFBundleIdentifier</key>
        <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
        <key>CFBundleInfoDictionaryVersion</key>
        <string>6.0</string>
        <key>CFBundleName</key>
        <string>$(PRODUCT_NAME)</string>
        <key>CFBundlePackageType</key>
        <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
        <key>CFBundleShortVersionString</key>
        <string>$(APP_VERSION)</string>
        <key>CFBundleVersion</key>
        <string>$(APP_BUILD)</string>
        <key>NSExtension</key>
        <dict>
            <key>NSExtensionPointIdentifier</key>
            <string>com.apple.widgetkit-extension</string>
        </dict>
    </dict>
    </plist>
    `;
}

export const withWidgetInfoPlist = (config: ExportedConfigWithProps<unknown>, options: WithExpoIOSWidgetsProps) => {
    const targetName = getTargetName(config, options)
    const plistFilePath = path.join(config.modRequest.projectRoot, 'ios', targetName, 'Info.plist')
    
    const bundleVersion = config.ios?.buildNumber ?? '1'
    const shortVersion = config?.version ?? '1.0'
    const plistContents = getPlistContents(bundleVersion, shortVersion)
    
    fsExtra.writeFileSync(plistFilePath, plistContents)
}
import { ConfigPlugin } from "expo/config-plugins"
import { getBundleIdentifier } from "./withWidgetXCode"
import { getPushNotificationsMode } from "./xcode/withEntitlements"
import { WithExpoIOSWidgetsProps } from ".."
import { getAppGroupEntitlement } from "./withAppGroupPermissions"
import { getTargetName } from "./xcode/target"

export const withAppExtensions: ConfigPlugin<WithExpoIOSWidgetsProps> = (config, options) => {
    const targetName = getTargetName(config, options)
    const bundleIdentifier = getBundleIdentifier(config, options)
    const entitlement = getAppGroupEntitlement(config)
    const appGroupEntitlements = (config.ios?.entitlements && config.ios.entitlements['com.apple.security.application-groups']) || []
  
    config.ios = {
      ...config.ios,
      entitlements: {
        ...(config.ios?.entitlements || {}),
        'com.apple.security.application-groups': [
          ...appGroupEntitlements,
          entitlement,
        ],
        'aps-environment': getPushNotificationsMode(options)
      }
    }
  
    config.extra = {
      ...config.extra,
      eas: {
        ...config.extra?.eas,
        build: {
          ...config.extra?.eas?.build,
          experimental: {
            ...config.extra?.eas?.build?.experimental,
            ios: {
              ...config.extra?.eas?.build?.experimental?.ios,
              appExtensions: [
                ...(config.extra?.eas?.build?.experimental?.ios?.appExtensions ?? []),
                {
                  // keep in sync with native changes in NSE
                  targetName,
                  bundleIdentifier,
                  entitlements: {
                    'com.apple.security.application-groups': [
                      entitlement,
                    ],
                    'aps-environment': getPushNotificationsMode(options)
                  },
                }
              ]
            }
          }
        }
      }
    }
  
    return config
  }
  
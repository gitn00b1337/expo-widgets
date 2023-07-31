import { ConfigPlugin, withEntitlementsPlist } from "expo/config-plugins"
import { WithExpoIOSWidgetsProps } from ".."
import { getBundleIdentifier, getTargetName } from "./withWidgetXCode"
import { Logging } from "../utils/logger"
import { ExpoConfig } from "@expo/config-types"
import { getPushNotificationsMode } from "./xcode/withAppGroupEntitlements"

const APP_GROUP_KEY = "com.apple.security.application-groups"

export const getAppGroupEntitlement = (config: ExpoConfig) => {
  return `group.${config?.ios?.bundleIdentifier || ""}.expowidgets`
}

const withAppGroupPermissions: ConfigPlugin<WithExpoIOSWidgetsProps> = (
  config,
  options
) => {
  return withEntitlementsPlist(config, newConfig => {
    if (!Array.isArray(newConfig.modResults[APP_GROUP_KEY])) {
      newConfig.modResults[APP_GROUP_KEY] = [];
    }

    const modResultsArray = (newConfig.modResults[APP_GROUP_KEY] as Array<any>);
    const entitlement = getAppGroupEntitlement(config);

    if (modResultsArray.indexOf(entitlement) !== -1) {
      Logging.logger.debug(`Adding entitlement ${entitlement} to config`)
      return newConfig;
    }

    modResultsArray.push(entitlement)

    newConfig.modResults['aps-environment'] = getPushNotificationsMode(options)

    return newConfig;
  });
};

const withAppExtensions: ConfigPlugin<WithExpoIOSWidgetsProps> = (config, options) => {
  const targetName = getTargetName(config, options)
  const bundleIdentifier = getBundleIdentifier(config, options)
  const entitlement = getAppGroupEntitlement(config)

  Logging.logger.debug(`withConfig:: adding target ${targetName} to appExtensions`)
  Logging.logger.debug(`withConfig:: adding bundle identifier ${bundleIdentifier} to appExtensions`)
  Logging.logger.debug(`withConfig:: adding entitlement ${entitlement} to appExtensions`)

  const appGroupEntitlements = (config.ios?.entitlements && config.ios?.entitlements['com.apple.security.application-groups']) || []

  config.ios = {
    ...config.ios,
    entitlements: {
      ...(config.ios?.entitlements || []),
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

const withLiveActivities: ConfigPlugin<WithExpoIOSWidgetsProps> = (config, options) => {
  config.ios = {
    ...config.ios,
    infoPlist: {
      ...config.ios?.infoPlist,
      NSSupportsLiveActivities: options?.useLiveActivities || false,
      NSSupportsLiveActivitiesFrequentUpdates: options?.frequentUpdates || false,
    }
  }

  return config;
}
export const withConfig: ConfigPlugin<WithExpoIOSWidgetsProps> = (config, options) => {
  withAppGroupPermissions(config, options)
  withAppExtensions(config, options)
  withLiveActivities(config, options)

  return config
}
import { ConfigPlugin } from "expo/config-plugins"
import { WithExpoIOSWidgetsProps } from ".."
import { getBundleIdentifier, getTargetName } from "./withWidgetXCode"
import { Logging } from "../utils/logger"

export const withConfig: ConfigPlugin<WithExpoIOSWidgetsProps> = (config, options) => {
  const targetName = getTargetName(config, options)
  const bundleIdentifier = getBundleIdentifier(config, options)

  let configIndex: null | number = null;
  config.extra?.eas?.build?.experimental?.ios?.appExtensions?.forEach(
    (ext: any, index: number) => {
      if (ext.targetName === targetName) {
        configIndex = index;
      }
    }
  );

  Logging.logger.debug(`withConfig:: adding target ${targetName} to appExtensions`)
  Logging.logger.debug(`withConfig:: adding bundle identifier ${bundleIdentifier} to appExtensions`)
  
  if (!configIndex) {
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
                ...(config.extra?.eas?.build?.experimental?.ios
                  ?.appExtensions ?? []),
                {
                  targetName,
                  bundleIdentifier,
                },
              ],
            },
          },
        },
      },
    };
    configIndex = 0;
  }

  if (configIndex != null && config.extra) {
    const appClipConfig =
      config.extra.eas.build.experimental.ios.appExtensions[configIndex];

    appClipConfig.entitlements = {};
  }

  return config;
};
import { ConfigPlugin, withEntitlementsPlist } from "expo/config-plugins";
import { WithExpoIOSWidgetsProps } from "..";
import { Logging } from "../utils/logger";
import { ExpoConfig } from "@expo/config-types";
import { getPushNotificationsMode } from "./xcode/withEntitlements";

const APP_GROUP_KEY = "com.apple.security.application-groups"

export const getAppGroupEntitlement = (config: ExpoConfig) => {
    return `group.${config?.ios?.bundleIdentifier || ""}.expowidgets`
  }
  
export const withAppGroupPermissions: ConfigPlugin<WithExpoIOSWidgetsProps> = (
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
  
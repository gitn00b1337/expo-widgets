import { ConfigPlugin } from "expo/config-plugins";
import { WithExpoIOSWidgetsProps } from "..";

export const withLiveActivities: ConfigPlugin<WithExpoIOSWidgetsProps> = (config, options) => {
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
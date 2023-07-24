import { WithExpoIOSWidgetsProps } from ".."
import { ConfigPlugin } from "@expo/config-plugins"
import { getTargetName, withWidgetXCode } from "./withWidgetXCode"
import { withConfig } from "./withWidgetEAS"
import { withPodfile } from "./withPodfile"

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

const defaultOptions = (): WithExpoIOSWidgetsProps => {
    return {
        src: 'widgets/ios',
        deploymentTarget: '16.4',
        useLiveActivities: false,
        frequentUpdates: false,
        devTeamId: '',
        
    }
}

export const withIOSWidgets: ConfigPlugin<WithExpoIOSWidgetsProps> = (config, options) => {
    const defaultedOptions = {
        ...defaultOptions,
        ...options,
    }

    config = withLiveActivities(config, defaultedOptions);
    config = withWidgetXCode(config, defaultedOptions)
    config = withPodfile(config, {
        targetName: `${getTargetName(config, defaultedOptions)}`
    })
    config = withConfig(config, defaultedOptions)
    return config;
}
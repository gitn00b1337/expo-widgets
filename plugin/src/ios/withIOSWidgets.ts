import { WithExpoIOSWidgetsProps } from ".."
import { ConfigPlugin, withInfoPlist } from "@expo/config-plugins"
import { getTargetName, withWidgetXCode } from "./withWidgetXCode"
import { withConfig } from "./withWidgetEAS"
import { withPodfile } from "./withPodfile"
import { withModule } from "./withModule"

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
        deploymentTarget: '16.2',
        useLiveActivities: false,
        frequentUpdates: false,
        devTeamId: '',
        moduleDependencies: [],
        xcode: {
            generateAppGroup: true,
        }
    }
}

export const withIOSWidgets: ConfigPlugin<WithExpoIOSWidgetsProps> = (config, options) => {
    const defaultedOptions = {
        ...defaultOptions,
        ...options,
    }

    config = withLiveActivities(config, defaultedOptions)
    config = withModule(config, defaultedOptions)
    config = withWidgetXCode(config, defaultedOptions)
    config = withPodfile(config, {
        targetName: `${getTargetName(config, defaultedOptions)}`,
        projectName: config.name
    })
    config = withConfig(config, defaultedOptions)

    return config;
}
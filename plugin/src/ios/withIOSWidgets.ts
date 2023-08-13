import { WithExpoIOSWidgetsProps } from ".."
import { ConfigPlugin, withXcodeProject } from "@expo/config-plugins"
import { withWidgetXCode } from "./withWidgetXCode"
import { withConfig } from "./withConfig"
import { withPodfile } from "./withPodfile"
import { withModule } from "./withModule"

const defaultOptions = (): WithExpoIOSWidgetsProps => {
    return {
        src: 'widgets/ios',
        deploymentTarget: '16.2',
        useLiveActivities: false,
        frequentUpdates: false,
        devTeamId: '',
        moduleDependencies: [],
        mode: 'production',
    }
}

export const withIOSWidgets: ConfigPlugin<WithExpoIOSWidgetsProps> = (config, options) => {
    const defaultedOptions = {
        ...defaultOptions,
        ...options,
    }

    withConfig(config, defaultedOptions)

    return withXcodeProject(config, config => {
        withModule(config, defaultedOptions)
        withWidgetXCode(config, defaultedOptions)
        withPodfile(config, defaultedOptions)

        return config;
    })    
}
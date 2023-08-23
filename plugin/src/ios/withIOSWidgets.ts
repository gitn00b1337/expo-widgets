import { WithExpoIOSWidgetsProps } from ".."
import { ConfigPlugin, withXcodeProject } from "@expo/config-plugins"
import { withWidgetXCode } from "./withWidgetXCode"
import { withConfig } from "./withConfig"
import { withPodfile } from "./withPodfile"
import { withModule } from "./withModule"
import { withAppGroupEntitlements } from "./xcode/withAppGroupEntitlements"
import { withWidgetInfoPlist } from "./xcode/withWidgetInfoPlist"

const defaultOptions = (): WithExpoIOSWidgetsProps => {
    return {
        src: 'widgets/ios',
        deploymentTarget: '16.2',
        useLiveActivities: false,
        frequentUpdates: false,
        devTeamId: '',
        moduleDependencies: [],
        mode: 'production',
        widgetExtPlugins: [],
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
        withAppGroupEntitlements(config, options)
        withWidgetInfoPlist(config, options)
        withPodfile(config, defaultedOptions)

        return config;
    })    
}
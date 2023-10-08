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
        xcode: {

        }
    }
}

export const withIOSWidgets: ConfigPlugin<WithExpoIOSWidgetsProps> = (config, options) => {
    const {
        src,
        deploymentTarget,
        useLiveActivities,
        frequentUpdates,
        moduleDependencies,
        mode,
        widgetExtPlugins,
        xcode,
    } = defaultOptions()

    const defaultedOptions = {
        src: options.src || src,
        deploymentTarget: options.deploymentTarget || deploymentTarget,
        useLiveActivities: options.useLiveActivities || useLiveActivities,
        frequentUpdates: options.frequentUpdates || frequentUpdates,
        devTeamId: options.devTeamId,
        moduleDependencies: options.moduleDependencies || moduleDependencies,
        mode: options.mode || mode,
        widgetExtPlugins: options.widgetExtPlugins || widgetExtPlugins,
        xcode: {
            widgetBundleIdentifier: options.xcode?.widgetBundleIdentifier || xcode?.widgetBundleIdentifier,
            appGroupId: options.xcode?.appGroupId || xcode?.appGroupId,
            configOverrides: options.xcode?.configOverrides ||  xcode?.configOverrides,
        }
    }

    config = withConfig(config, defaultedOptions)

    return withXcodeProject(config, config => {
        withModule(config, defaultedOptions)
        withWidgetXCode(config, defaultedOptions)
        withAppGroupEntitlements(config, options)
        withWidgetInfoPlist(config, options)
        withPodfile(config, defaultedOptions)

        return config;
    })    
}
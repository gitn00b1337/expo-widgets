import { ConfigPlugin } from "@expo/config-plugins";
import { withIOSWidgets } from "./ios/withIOSWidgets";

export type WithExpoAndroidWidgetsProps = {
    /**
     * The directory of your widget native code. 
     */
    src: string
}

export type WithExpoIOSWidgetsProps = {
    /**
     * The directory of your widget native code. 
     */
    src: string
    /**
     * The deployment target for app. Defaults to 16.2 to support live activities.
     */
    deploymentTarget: string
    /**
     * Enable live activities within your app (SSupportsLiveActivities)
     */
    useLiveActivities: boolean
    /**
     * Enable live activity frequent updates (NSSupportsLiveActivitiesFrequentUpdates)
     */
    frequentUpdates: boolean
    /**
     * Apple developer team ID
     */
    devTeamId: string
    /**
     * XCode project overwrites. Use with caution!
     */
    xcode?: {
        targetName?: string
        widgetBundleIdentifier?: string
        generateAppGroup?: boolean
        appGroupId?: string
    }
    /**
     * A collection of relative file paths to files your module file needs (like shared models)
     */
    moduleDependencies: string[]
}

export type WithExpoWidgetsProps = {
    android?: WithExpoAndroidWidgetsProps
    ios?: WithExpoIOSWidgetsProps
}

const withExpoWidgets: ConfigPlugin<WithExpoWidgetsProps> = (config, options) => {
    if (options.android) config = withAndroidWidgets(config, options.android);
    if (options.ios) config = withIOSWidgets(config, options.ios);
    return config;
}

const withAndroidWidgets: ConfigPlugin<WithExpoAndroidWidgetsProps> = (config, options) => {
    // coming soon!
    return config;
}



export default withExpoWidgets;
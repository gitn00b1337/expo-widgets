import { ConfigPlugin } from "@expo/config-plugins";
import { withIOSWidgets } from "./ios/withIOSWidgets";
import { withAndroidWidgets } from "./android/withAndroidWidgets";

export type AndroidWidgetProjectSettings = {

    name: string;
    /**
     * Your widget resource name e.g. @xml/sample_widget_info
     */
    resourceName: string;
}

export type WithExpoAndroidWidgetsProps = {
    /**
     * The directory of your widget native code. 
     */
    src: string;

    widgets: AndroidWidgetProjectSettings[];    
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

    targetName?: string

    mode?: 'development' | 'production'
    /**
     * XCode project overwrites. Use with caution!
     */
    xcode?: {
        widgetBundleIdentifier?: string
        appGroupId?: string
        configOverrides?: { [ attributeName: string ]: string }
    }
    /**
     * A collection of relative file paths to files your module file needs (like shared models)
     */
    moduleDependencies: string[]
    /**
     * Plugins to run after the widget extension is created
     */
    widgetExtPlugins: ConfigPlugin<any>[]
}

export type WithExpoWidgetsProps = {
    android?: WithExpoAndroidWidgetsProps
    ios?: WithExpoIOSWidgetsProps
    
}

const withExpoWidgets: ConfigPlugin<WithExpoWidgetsProps> = (config, options) => {
    if (options.android) {
        config = withAndroidWidgets(config, options.android);
    }

    if (options.ios) {
        config = withIOSWidgets(config, options.ios);
    }

    return config;
}

export default withExpoWidgets;
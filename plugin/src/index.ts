import { ConfigPlugin } from "@expo/config-plugins";
import { withIOSWidgets } from "./ios/withIOSWidgets";
import { withAndroidWidgets } from "./android/withAndroidWidgets";
import { PlistObject } from "plist";

export type AndroidWidgetProjectSettings = {
    /**
     * The widget name
     */
    name: string;
    /**
     * The widget resource name e.g. @xml/sample_widget_info
     */
    resourceName: string;
}

export type WithExpoAndroidWidgetsProps = {
    /**
     * The directory of your widget native code. 
     */
    src: string;
    /**
     * The widget options required to configure the android project
     * with the provided source files
     */
    widgets: AndroidWidgetProjectSettings[];    
    /**
     * For apps with multiple distributions e.g. com.mycomp.app and dev.mycomp.app, setting 
     * a distribution placeholder will automatically replace all imports and package declarations
     * in kotlin files with expo.android.package in your app.(ts/json). 
     */
    distPlaceholder: string;
}

export type IOSEntitlements = PlistObject;

export type WithExpoIOSWidgetsProps = {
    /**
     * The directory of your widget native code. 
     */
    src: string;
    /**
     * The deployment target for app. Defaults to 16.2 to support live activities.
     */
    deploymentTarget: string;
    /**
     * Enable live activities within your app (SSupportsLiveActivities)
     */
    useLiveActivities: boolean;
    /**
     * Enable live activity frequent updates (NSSupportsLiveActivitiesFrequentUpdates)
     */
    frequentUpdates: boolean;
    /**
     * Apple developer team ID
     */
    devTeamId: string;
    /**
     * The target name aka extension name
     */
    targetName?: string;

    mode?: 'development' | 'production';
    /**
     * XCode project overwrites. Use with caution!
     */
    xcode?: {
        /**
         * The bundle ID for the widget(s)
         */
        widgetBundleIdentifier?: string;
        /**
         * Optional appGroupId override
         */
        appGroupId?: string;
        /**
         * Optional entitlements
         */
        entitlements?: IOSEntitlements;
        /**
         * Within xcode there is a configuration block. You can customise the config 
         * here if you have specific needs
         */
        configOverrides?: { [ attributeName: string ]: string };
        /**
         * Controls the podfile APP_EXTENSION_API_ONLY setting.
         */
        appExtAPI?: boolean;
    }
    /**
     * A collection of relative file paths to files your module file needs (like shared models)
     */
    moduleDependencies: string[];
    /**
     * Plugins to run after the widget extension is created
     */
    widgetExtPlugins: ConfigPlugin<any>[];
}

export type WithExpoWidgetsProps = {
    android?: WithExpoAndroidWidgetsProps;
    ios?: WithExpoIOSWidgetsProps;    
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
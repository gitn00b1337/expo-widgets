import { ConfigPlugin } from "@expo/config-plugins";
import { WithExpoAndroidWidgetsProps } from "..";
import { withSourceFiles } from "./withSourceFiles";
import { withModule } from "./withModule";
import { withGsonGradle, withWidgetAppBuildGradle } from "./withAppBuildGradle";
import { withWidgetProjectBuildGradle } from "./withProjectBuildGradle";
import { withWidgetManifest } from "./withWidgetManifest";

const DEFAULT_OPTIONS: WithExpoAndroidWidgetsProps = {
    src: 'widgets/android',
}

function getDefaultedOptions(options: WithExpoAndroidWidgetsProps) {
    return {
        ...DEFAULT_OPTIONS,
        ...options,
    }
}

export const withAndroidWidgets: ConfigPlugin<WithExpoAndroidWidgetsProps> = (config, userOptions) => {
    const options = getDefaultedOptions(userOptions);

    config = withWidgetManifest(config);
    config = withWidgetProjectBuildGradle(config);
    config = withWidgetAppBuildGradle(config);
    config = withGsonGradle(config);
    config = withSourceFiles(config, options);
    config = withModule(config, options);

    return config;
}


import { ConfigPlugin } from "@expo/config-plugins";
import { WithExpoAndroidWidgetsProps } from "..";
import { withSourceFiles } from "./withSourceFiles";
import { withModule } from "./withModule";

const DEFAULT_OPTIONS: WithExpoAndroidWidgetsProps = {
    src: 'widgets/android',
    moduleFileName: 'ExpoWidgetsModule.kt',
}

function getDefaultedOptions(options: WithExpoAndroidWidgetsProps) {
    return {
        ...DEFAULT_OPTIONS,
        ...options,
    }
}

export const withAndroidWidgets: ConfigPlugin<WithExpoAndroidWidgetsProps> = (config, userOptions) => {
    const options = getDefaultedOptions(userOptions);

    config = withSourceFiles(config, options);
    config = withModule(config, options);

    return config;
}
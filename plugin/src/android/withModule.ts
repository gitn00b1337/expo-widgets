import path from "path"
import { WithExpoAndroidWidgetsProps } from ".."
import fs from "fs-extra"
import { ConfigPlugin, withDangerousMod, AndroidConfig } from "@expo/config-plugins"
import { getTemplate } from "./module-template"

export const withModule: ConfigPlugin<WithExpoAndroidWidgetsProps> = (
    config,
    options,
) => {
    return withDangerousMod(config, [
        "android",
        async newConfig => {
            const { modRequest } = newConfig;

            const platformRoot = modRequest.platformProjectRoot;
            const widgetFolderPath = path.join(modRequest.projectRoot, options.src);
            const packageName = AndroidConfig.Package.getPackage(config);

            if (!packageName) {
                throw new Error(`ExpoWidgets:: app.(ts/json) must provide a value for android.package.`);
            }

            const packageNameAsPath = packageName?.replace(/\./g, "/");
            const moduleSourcePath = path.join(widgetFolderPath, 'src/main/java/package_name/ExpoWidgetsModule.kt');
            const moduleDestinationPath = path.join(
                platformRoot, 
                'app/src/main/java', 
                packageNameAsPath, 
                'ExpoWidgetsModule.kt'
            );

            if (!fs.existsSync(moduleSourcePath)) {
                const contents = getTemplate(packageName);
                fs.writeFileSync(moduleDestinationPath, contents);
            }

            return newConfig;
        }
    ]);
}

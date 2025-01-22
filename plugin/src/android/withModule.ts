import path from "path"
import { WithExpoAndroidWidgetsProps } from ".."
import fs from "fs-extra"
import { ConfigPlugin, withDangerousMod, AndroidConfig } from "@expo/config-plugins"
import { getTemplate } from "./module-template"
import { Logging } from "../utils/logger"

export const withModule: ConfigPlugin<WithExpoAndroidWidgetsProps> = (
    config,
    options,
) => {
    return withDangerousMod(config, [
        "android",
        async newConfig => {
            const { modRequest } = newConfig;

            const projectRoot = modRequest.projectRoot;            
            const platformRoot = modRequest.platformProjectRoot;
            const widgetFolderPath = path.join(modRequest.projectRoot, options.src);
            const packageName = AndroidConfig.Package.getPackage(config);

            if (!packageName) {
                throw new Error(`ExpoWidgets:: app.(ts/json) must provide a value for android.package.`);
            }

            const packageNameAsPath = packageName?.replace(/\./g, "/");
            const moduleSourcePath = path.join(widgetFolderPath, 'src/main/java/package_name/ExpoWidgetsModule.kt');
            const moduleDestinationPath = path.join(
                projectRoot, 
                'android/src/main/java', 
                packageNameAsPath, 
                'Module.kt'
            );

            if (!fs.existsSync(moduleSourcePath)) {
                Logging.logger.debug('No module file found. Adding template...');
                const contents = getTemplate(packageName);
            }

            return newConfig;
        }
    ]);
}

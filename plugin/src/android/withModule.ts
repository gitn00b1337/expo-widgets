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
            const widgetFolderPath = path.join(modRequest.projectRoot, options.src, 'src/main/java/package_name');
            const androidFolder = path.join(__dirname, '../../../android/src/main/java/expo/modules/widgets/')
            const packageName = AndroidConfig.Package.getPackage(config);

            if (!packageName) {
                throw new Error(`ExpoWidgets:: app.(ts/json) must provide a value for android.package.`);
            }

            const packageNameAsPath = packageName?.replace(/\./g, "/");
            const moduleSourcePath = path.join(widgetFolderPath, 'Module.kt');
            const moduleDestinationPath = path.join(androidFolder, 'ExpoWidgetsModule.kt');

            if (!fs.existsSync(moduleSourcePath)) {
                Logging.logger.debug('No module file found. Adding template...');
                const contents = getTemplate(packageName);
                fs.writeFileSync(moduleDestinationPath, contents);
            }
            else {
                fs.copyFileSync(moduleSourcePath, moduleDestinationPath);
            }

            if (options.moduleDependencies) {
                for (const dep of options.moduleDependencies) {
                    const filePath = path.join(widgetFolderPath, dep)
                    const destination = path.join(androidFolder, path.basename(dep))
                    Logging.logger.debug(`Copying ${filePath} to ${destination}`)
                    fs.copyFileSync(filePath, destination)
                }
            }

            return newConfig;
        }
    ]);
}

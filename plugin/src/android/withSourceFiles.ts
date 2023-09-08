import path from "path"
import { WithExpoAndroidWidgetsProps } from ".."
import { Logging } from "../utils/logger"
import fs from "fs-extra"
import { ConfigPlugin, withDangerousMod, AndroidConfig } from "@expo/config-plugins"

export const withSourceFiles: ConfigPlugin<WithExpoAndroidWidgetsProps> = (
    config,
    options,
) => {
    return withDangerousMod(config, [
        "android",
        async newConfig => {
            const { modRequest } = newConfig;

            const projectRoot = modRequest.projectRoot;
            const platformRoot = modRequest.platformProjectRoot;
            const widgetFolderPath = path.join(projectRoot, options.src);
            const packageName = AndroidConfig.Package.getPackage(config);

            if (!packageName) {
                throw new Error(`ExpoWidgets:: app.(ts/json) must provide a value for android.package.`);
            }

            copyResourceFiles(widgetFolderPath, platformRoot);
            copySourceFiles(widgetFolderPath, platformRoot, packageName);

            return newConfig;
        }
    ]);
}

function copyResourceFiles(widgetFolderPath: string, platformRoot: string) {
    const resourcesFolder = path.join(widgetFolderPath, 'src/res');
    const destinationFolder = path.join(platformRoot, 'app/src/main/res');

    if (!fs.existsSync(resourcesFolder)) {
        Logging.logger.debug(`No resource "res" folder found in the widget source directory ${widgetFolderPath}. No resource files copied over.`);
        return;
    }

    Logging.logger.debug(`Copying resources from ${resourcesFolder} to ${destinationFolder}`);

    safeCopy(resourcesFolder, destinationFolder);
}

function safeCopy(sourcePath: string, destinationPath: string) {
    try {
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath);
        }
        
        fs.copySync(sourcePath, destinationPath);
    }
    catch (e) {
        Logging.logger.warn(e);
    }
}

function copySourceFiles(
    widgetFolderPath: string,
    platformRoot: string,
    packageName: string,
) {
    const packageNameAsPath = packageName?.replace(/\./g, "/");
    const mainFolderSrc = path.join(widgetFolderPath, 'src/main/java/package_name');
    const destinationFolder = path.join(platformRoot, 'app/src/main/java', packageNameAsPath);

    if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder);
    }

    Logging.logger.debug(`Copying source files from ${mainFolderSrc} to ${destinationFolder}`);

    const paths = fs.readdirSync(mainFolderSrc);

    for (const relativePath of paths) {
        const sourcePath = path.join(mainFolderSrc, relativePath);
        const destinationPath = path.join(destinationFolder, relativePath);

        if (fs.lstatSync(sourcePath).isDirectory()) {
            // If src is a directory it will copy everything inside of this directory, not the entire directory itself
            fs.emptyDirSync(destinationPath);
        }
        
        fs.copySync(sourcePath, destinationPath);
    }
}

function ensureModuleFile(widgetFolderPath: string, platformRoot: string, packageName: string) {
    const packageNameAsPath = packageName?.replace(/\./g, "/");
    const moduleSourcePath = path.join(widgetFolderPath, 'src/main/java/package_name/ExpoWidgetsModule.kt');
    const moduleDestinationPath = path.join(platformRoot, 'app/src/main/java', packageNameAsPath, 'ExpoWidgetsModule.kt');

    safeCopy(moduleSourcePath, moduleDestinationPath);
}
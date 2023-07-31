import { ConfigPlugin, withXcodeProject, } from "@expo/config-plugins"
import fs from "fs"
import fsExtra from "fs-extra"
import path from "path"
import { WithExpoIOSWidgetsProps } from ".."
import { getTemplate } from "./module-template"
import { Logging } from "../utils/logger"

export const withModule: ConfigPlugin<WithExpoIOSWidgetsProps> = (
    config,
    options,
) => {
    return withXcodeProject(config, (props) => {
        try {
            const {
                projectRoot,
            } = props.modRequest

            const widgetFolderPath = path.join(projectRoot, options.src)
            
            Logging.logger.debug(`Current directory::: ${__dirname}`)
            const expoModulePath = path.join(__dirname, '../../../ios/ExpoWidgetsModule.swift')
            Logging.logger.debug(`Expo module path: ${expoModulePath}`)

            const moduleFile = path.join(widgetFolderPath, 'Module.swift')

            if (!fs.existsSync(moduleFile)) {
                // the module file is optional. if they don't provide then it's a simple widget with no
                // need for comms between app and the widget
                // to avoid writes from previous runs, extract contents from the template and overwrite any previous changes
                const templatePath = path.join(__dirname, 'module.template.swift')
                Logging.logger.debug(`No Module.swift provided. Using template ${templatePath}`)

                const contents = getTemplate()
                fsExtra.outputFileSync(expoModulePath, contents)
            }
            else {
                const contents = fs.readFileSync(moduleFile)                
    
                if (!fs.existsSync(expoModulePath)) {
                    throw new Error(`No expo module found within expo-widgets! Contact us.`)
                }
                
                fsExtra.outputFileSync(expoModulePath, contents)
            }

            const writtenContent = fsExtra.readFileSync(moduleFile, 'utf-8')
            Logging.logger.debug(`Module.swift contents::`)
            Logging.logger.debug(writtenContent)

            return props
        }
        catch (e) {
            console.error(e)
            throw e
        }
    })
}
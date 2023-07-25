import { ConfigPlugin, withXcodeProject, } from "@expo/config-plugins"
import fs from "fs"
import fsExtra from "fs-extra"
import path from "path"
import { WithExpoIOSWidgetsProps } from ".."

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
            console.log(`Current directory::: ${__dirname}`)
            const expoModulePath = path.join(__dirname, '../../../ios/ExpoWidgetsModule.swift')
            console.log(`Expo module path: ${expoModulePath}`)

            const moduleFile = path.join(widgetFolderPath, 'Module.swift')

            if (!fs.existsSync(moduleFile)) {
                // the module file is optional. if they don't provide then it's a simple widget with no
                // need for comms between app and the widget
                // to avoid writes from previous runs, extract contents from the template and overwrite any previous changes
                const templatePath = path.join(__dirname, 'module.template.swift')
                console.log(`No Module.swift provided. Using template ${templatePath}`)

                if (!fs.existsSync(templatePath)) {
                    throw new Error(`No expo module template found within expo-widgets! Contact us.`)
                }

                const contents = fs.readFileSync(templatePath)
                fsExtra.outputFileSync(expoModulePath, contents)
            }
            else {
                const contents = fs.readFileSync(moduleFile)                
    
                if (!fs.existsSync(expoModulePath)) {
                    throw new Error(`No expo module found within expo-widgets! Contact us.`)
                }
                
                fsExtra.outputFileSync(expoModulePath, contents)
            }

            return props
        }
        catch (e) {
            console.error(e)
            throw e
        }
    })
}
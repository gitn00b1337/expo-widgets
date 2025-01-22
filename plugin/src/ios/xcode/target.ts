import { IOSConfig, XcodeProject } from "expo/config-plugins"
import { ExpoConfig } from "@expo/config-types"
import { WithExpoIOSWidgetsProps } from "../.."

export const getPBXTargetByName = (project: XcodeProject, name: string) => {
    var targetSection = project.pbxNativeTargetSection()

    for (const uuid in targetSection) {
        const target = targetSection[uuid]
        
        if (target.name === name) {
            return {
                uuid,
                target,
            }
        }    
    }

    return { target: null, uuid: null }
}

/**
 * Gets the target name either via a sanitised config.name + Widgets or if provided options.xcode.targetName
 * @param config The expo config
 * @param options The ios config options
 * @returns The target name
 */
export const getTargetName = (config: ExpoConfig, options: WithExpoIOSWidgetsProps) => {
    if (options.targetName) {
      return IOSConfig.XcodeUtils.sanitizedName(options.targetName)
    }
  
    const cleanName = IOSConfig.XcodeUtils.sanitizedName(config.name)
    return `${cleanName}WidgetExtension`;
  }
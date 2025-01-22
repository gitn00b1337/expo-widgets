import { WithExpoIOSWidgetsProps } from "../.."
import { getBundleIdentifier } from "../withWidgetXCode"
import { ExpoConfig } from "@expo/config-types"
import { getTargetName } from "./target"

export const getDefaultBuildConfigurationSettings = (options: WithExpoIOSWidgetsProps, config: ExpoConfig) => {
    const targetName = getTargetName(config, options)
    const deploymentTarget = options.deploymentTarget
    const developmentTeamId = options.devTeamId
    const bundleIdentifier = getBundleIdentifier(config, options)
    const currentProjectVersion = config.ios?.buildNumber || '1'
    const marketingVersion = config.version || '1.0'
  
    return {
      ALWAYS_SEARCH_USER_PATHS: 'NO',
      ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES: 'YES',
      ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME: "AccentColor",
      ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME: "WidgetBackground",
      CLANG_ANALYZER_NONNULL: "YES",
      CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
      //CLANG_CXX_LANGUAGE_STANDARD: '"gnu++20"',
      CLANG_ENABLE_OBJC_WEAK: "YES",
      CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
      //CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
      CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
      CODE_SIGN_STYLE: "Automatic",
      CODE_SIGN_ENTITLEMENTS: `${targetName}/${targetName}.entitlements`,
      CURRENT_PROJECT_VERSION: `${currentProjectVersion}`,
      DEBUG_INFORMATION_FORMAT: "dwarf",
      DEVELOPMENT_TEAM: `${developmentTeamId}`,
      GCC_C_LANGUAGE_STANDARD: "gnu11",
      GENERATE_INFOPLIST_FILE: "YES",
      INFOPLIST_FILE: `${targetName}/Info.plist`,
      INFOPLIST_KEY_CFBundleDisplayName: targetName,
      INFOPLIST_KEY_NSHumanReadableCopyright: '""',
      IPHONEOS_DEPLOYMENT_TARGET: `${deploymentTarget}`,
      LD_RUNPATH_SEARCH_PATHS:
        '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"',
      MARKETING_VERSION: `${marketingVersion}`,
      MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE",
      MTL_FAST_MATH: "YES",
      PRODUCT_NAME: '"$(TARGET_NAME)"',
      PRODUCT_BUNDLE_IDENTIFIER: `${bundleIdentifier}`,
      SKIP_INSTALL: "NO",
      SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG",
      SWIFT_EMIT_LOC_STRINGS: "YES",
      SWIFT_OPTIMIZATION_LEVEL: "-Onone",
      SWIFT_VERSION:  "5.4",
      TARGETED_DEVICE_FAMILY: '"1,2"',
      ...(options.xcode?.configOverrides || {}),
    }
  }
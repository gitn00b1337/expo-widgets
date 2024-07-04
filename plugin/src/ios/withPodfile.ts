import { mergeContents } from "@expo/config-plugins/build/utils/generateCode"
import { ExportedConfigWithProps, XcodeProject, } from "expo/config-plugins"
import * as fs from "fs"
import * as path from "path"
import { Logging } from "../utils/logger"
import { getTargetName } from "./withWidgetXCode"
import { WithExpoIOSWidgetsProps } from ".."

export const withPodfile = (config: ExportedConfigWithProps<XcodeProject>, options: WithExpoIOSWidgetsProps) => {
  const targetName = `${getTargetName(config, options)}`

  const podFilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
  let podFileContent = fs.readFileSync(podFilePath).toString();

  const podInstaller = `
  target '${targetName}' do
  use_expo_modules!
  config = use_native_modules!

  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
  use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => podfile_properties['expo.jsEngine'] == nil || podfile_properties['expo.jsEngine'] == 'hermes',
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/..",
    :privacy_file_aggregation_enabled => podfile_properties['apple.privacyManifestAggregationEnabled'] != 'false',
  )
end
      `
//   const podInstaller = `
// target '${targetName}' do
//   use_expo_modules!
//   config = use_native_modules!

//   use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
//   use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

//   # Flags change depending on the env values.
//   flags = get_default_flags()

//   use_react_native!(
//     :path => config[:reactNativePath],
//     :hermes_enabled => podfile_properties['expo.jsEngine'] == nil || podfile_properties['expo.jsEngine'] == 'hermes',
//     :fabric_enabled => flags[:fabric_enabled],
//     # An absolute path to your application root.
//     :app_path => "#{Pod::Config.instance.installation_root}/..",
//     # Note that if you have use_frameworks! enabled, Flipper will not work if enabled
//     :flipper_configuration => flipper_config
//   )

// end
//       `

  const withAppExtFix = mergeContents({
    tag: "app_ext_fix",
    src: podFileContent,
    newSrc: `
        config.build_settings['APPLICATION_EXTENSION_API_ONLY'] = 'No'
        `,
    anchor: /resource_bundle_target.build_configurations.each do \|config\|/,
    offset: 1,
    comment: "#",
  })

  const withAppExtFixPt2 = mergeContents({
    tag: 'fix2',
    src: withAppExtFix.contents,
    newSrc: ` installer.pods_project.targets.each do |target|
        target.build_configurations.each do |config|
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
          config.build_settings['APPLICATION_EXTENSION_API_ONLY'] = 'No'        
        end
      end`,
    anchor: /post_install do \|installer\|/,
    offset: 1,
    comment: "#",
  })

  const withPodInstall = mergeContents({
    tag: 'expo-widgets',
    src: withAppExtFixPt2.contents,
    newSrc: podInstaller,
    anchor: /target /,// new RegExp(`target '${projectName}' do`),
    offset: 0,
    comment: "#",
  })

  Logging.logger.debug('Updating podfile')

  fs.writeFileSync(podFilePath, withPodInstall.contents);

  return config;

}
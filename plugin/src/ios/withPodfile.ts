import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";
import { ConfigPlugin, withDangerousMod } from "expo/config-plugins";
import * as fs from "fs";
import * as path from "path";

export const withPodfile: ConfigPlugin<{ targetName: string }> = (
  config,
  { targetName }
) => {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podFilePath = path.join( config.modRequest.platformProjectRoot, "Podfile" );
      let podFileContent = fs.readFileSync(podFilePath).toString();

      const postInstaller = `
      target 'expowidgetsWidgetExtension' do
        use_expo_modules!
        config = use_native_modules!

        use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
        use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

        # Flags change depending on the env values.
        flags = get_default_flags()

        use_react_native!(
          :path => config[:reactNativePath],
          :hermes_enabled => podfile_properties['expo.jsEngine'] == nil || podfile_properties['expo.jsEngine'] == 'hermes',
          :fabric_enabled => flags[:fabric_enabled],
          # An absolute path to your application root.
          :app_path => "#{Pod::Config.instance.installation_root}/..",
          # Note that if you have use_frameworks! enabled, Flipper will not work if enabled
          :flipper_configuration => flipper_config
        )

        post_integrate do |installer|
          begin
            expo_patch_react_imports!(installer)
          rescue => e
            Pod::UI.warn e
          end
        end
      end
      `

      podFileContent = podFileContent
          .concat(
`
target 'expowidgetsWidgetExtension' do |target|
  use_expo_modules!
  config = use_native_modules!

  target.build_configurations.each do |bc|
      bc.build_settings['APPLICATION_EXTENSION_API_ONLY'] = 'No'
  end

  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
  use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

  # Flags change depending on the env values.
  flags = get_default_flags()

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => podfile_properties['expo.jsEngine'] == nil || podfile_properties['expo.jsEngine'] == 'hermes',
    :fabric_enabled => flags[:fabric_enabled],
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/..",
    # Note that if you have use_frameworks! enabled, Flipper will not work if enabled
    :flipper_configuration => flipper_config
  )  
end
`)
    
      //fs.writeFileSync(podFilePath, podFileContent);

      return config;
    },
  ]);
};
import { ConfigPlugin } from "expo/config-plugins"
import { WithExpoIOSWidgetsProps } from ".."
import { withLiveActivities } from "./withLiveActivities"
import { withAppExtensions } from "./withAppExtensions"
import { withAppGroupPermissions } from "./withAppGroupPermissions"

export const withConfig: ConfigPlugin<WithExpoIOSWidgetsProps> = (config, options) => {
  withAppGroupPermissions(config, options)
  withAppExtensions(config, options)
  withLiveActivities(config, options)

  return config
}
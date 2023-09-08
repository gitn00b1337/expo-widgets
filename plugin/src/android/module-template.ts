
export function getTemplate(packageDefinition: string) {
    return `
    /*
        Module code inserted by expo-widgets.
    */
    package ${packageDefinition}

    import expo.modules.kotlin.modules.Module
    import expo.modules.kotlin.modules.ModuleDefinition
    
    class ExpoWidgetsModule : Module() {
      override fun definition() = ModuleDefinition {
        Name("ExpoWidgets")
      }
    }`;
}
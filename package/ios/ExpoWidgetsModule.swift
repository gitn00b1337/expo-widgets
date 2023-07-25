import ExpoModulesCore
import ActivityKit

internal class MissingCurrentWindowSceneException: Exception {
    override var reason: String {
        "Cannot determine the current window scene in which to present the modal for requesting a review."
    }
}

public class ExpoWidgetsModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoWidgets")
        
    }
}
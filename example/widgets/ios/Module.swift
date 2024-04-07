import ExpoModulesCore
import ActivityKit
import WidgetKit

struct SetDataProps: Record {
  @Field
  var message: String
}

// the module is the message handler between your app and the widget
// you MUST declare the name of the module and then write whatever functions
// you wish your app to send over
public class ExpoWidgetsModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoWidgets")
        
        Function("setWidgetData") { (data: String) -> Void in   
            let logger = Logger()        
            // here we are using UserDefaults to send data to the widget
            // you MUST use a suite name of the format group.{your project bundle id}.expowidgets
            let widgetSuite = UserDefaults(suiteName: "group.expo.modules.widgets.example.expowidgets")
            widgetSuite?.set(data, forKey: "MyData")
            logger.info("Encoded data saved to suite group.expo.modules.widgets.example.expowidgets, key MyData")
            logger.info(data)

            // this is optional, but while your app is open and in focus
            // messages sent to the widget do not count towards its timeline limitations
            if #available(iOS 14.0, *) {
               WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }
}
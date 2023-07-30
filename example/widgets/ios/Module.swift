import ExpoModulesCore
import ActivityKit

struct SetDataProps: Record {
  @Field
  var message: String
}

public class ExpoWidgetsModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoWidgets")
        
        Function("setData") { (props: SetDataProps) -> Void in   
            let logger = Logger()        
            do {
                let myData = MyData(
                  message: props.message
              )

              let encoder = JSONEncoder()
              let data = try encoder.encode(myData)
              UserDefaults.standard.set(data, forKey: "MyData")
              logger.info("Encoded data saved to key MyData")
            } 
            catch (let error) {
                logger.info("An error occured setting MyData!")
            }
        }
    }
}
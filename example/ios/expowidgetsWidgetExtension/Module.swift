import ExpoModulesCore
import ActivityKit

struct SetUKBreakdownProps: Record {
  @Field
  var version: String = "0.1"

  @Field
  var totalPct: Double = 0

  @Field
  var date: Int?

  @Field
  var month: Int?

  @Field
  var year: Int?

  @Field
  var windPct: Int?

  @Field
  var solarPct: Int?

  @Field
  var hydroPct: Int?

  @Field
  var thermalPct: Int?

  @Field
  var tidalPct: Int?

  @Field
  var bioPct: Int?
}

public class ExpoWidgetsModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoWidgets")

        Function("areActivitiesEnabled") { () -> Bool in
            let logger = Logger()
            logger.info("areActivitiesEnabled()")
            
            if #available(iOS 16.2, *) {
                return ActivityAuthorizationInfo().areActivitiesEnabled
            } else {
                return false
            }
        }

        // Don't get caught out! The expo module API is limited to a maximum of 8 arguments (incl. promise) due to swift
        //
        Function("setUKBreakdown") { (props: SetUKBreakdownProps) -> Void in
            let logger = Logger()
            logger.info("setUKBreakdown()")
            let today = Date()
            let dc = Calendar.current.dateComponents([.day, .month, .year], from: today)
          
            do {
                let breakdown = UKBreakdown(
                  version: props.version,
                  totalPct: props.totalPct,
                  date: props.date ?? dc.day ?? 1,
                  month: props.month ?? dc.month ?? 1,
                  year: props.year ?? dc.year ?? 2023,
                  windPct: props.windPct ?? 0,
                  solarPct: props.solarPct ?? 0,
                  hydroPct: props.hydroPct ?? 0,
                  thermalPct: props.thermalPct ?? 0,
                  tidalPct: props.tidalPct ?? 0,
                  bioPct: props.bioPct ?? 0
              )

              let encoder = JSONEncoder()
              logger.info("Encoding breakdown to key UKBreakdown")
              os_log("Encoding breakdown to key", type: .info)
              let data = try encoder.encode(breakdown)
              UserDefaults.standard.set(data, forKey: "UKBreakdown")
            } catch (let error) {
              logger.error("An error occured setting UK breakdown: \(error.localizedDescription)")
              os_log("An error occured setting UK breakdown: %@", type: .error, error.localizedDescription)
            }
        }
    }
}

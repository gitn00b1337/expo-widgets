import WidgetKit
import SwiftUI

extension Date {
    func dayOfMonthFormat() -> String {
        self.formatted(
            .dateTime.day(.twoDigits)
        )
    }
    
    func monthFormat() -> String {
        self.formatted(
            .dateTime.month(.wide)
        )
    }
    
    func yearFormat() -> String {
        self.formatted(
            .dateTime.year(.defaultDigits)
        )
    }
}
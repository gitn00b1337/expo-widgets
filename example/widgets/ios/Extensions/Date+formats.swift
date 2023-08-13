import WidgetKit
import SwiftUI

// a random date extension file to show folder structures are copied too
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
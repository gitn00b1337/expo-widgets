
import SwiftUI

public struct FontManager {
  static func printAll() {
    UIFont.familyNames.forEach({ familyName in
      let fontNames = UIFont.fontNames(forFamilyName: familyName)
      print(familyName, fontNames)
    })
  }
}
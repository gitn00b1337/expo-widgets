import SwiftUI

public extension Font {
  static func customFont(
    familyName: String,
    fontName: String,
    size: CGFloat,
    weight: SwiftUI.Font.Weight
  ) -> Font {
    if let family = UIFont.familyNames.first(where: { $0 == familyName }) {
      let names = UIFont.fontNames(forFamilyName: family)
      
      if names.first(where: { $0 == fontName }) != nil {
        return Font.custom(fontName, size: size)
      }
    }
    
    return Font.system(size: size).weight(weight)
  }
  
  static func montserratBold(size: CGFloat) -> Font {
    return Font.customFont(
      familyName: "Montserrat",
      fontName: "Montserrat-Bold",
      size: size,
      weight: .bold
    )
  }
}
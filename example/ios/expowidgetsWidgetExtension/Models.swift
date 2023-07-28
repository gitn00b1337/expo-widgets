

public struct UKBreakdown: Codable {
    var version: String
    var totalPct: Double
    var date: Int
    var month: Int
    var year: Int
    var windPct: Int
    var solarPct: Int
    var hydroPct: Int
    var thermalPct: Int
    var tidalPct: Int
    var bioPct: Int
}

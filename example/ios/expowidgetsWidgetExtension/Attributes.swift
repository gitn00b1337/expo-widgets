import Foundation
import ActivityKit

struct Attributes: ActivityAttributes {
    public typealias Status = ContentState
    
    public struct ContentState: Codable, Hashable {
        
    }
    
    var example: Int
}
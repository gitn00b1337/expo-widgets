
import WidgetKit
import SwiftUI

func getUpdatedOverviewEntry() -> UKOverviewEntry {
    var entry = getUpdatedEntry()

    return UKOverviewEntry(
        date: entry.date,
        totalPct: entry.totalPct
    )
}

// this controls when to update the display
struct Provider: TimelineProvider {
    // when the widget has no data
    // func placeholder(in context: Context) -> UKOverviewEntry {
    func placeholder(in context: Context) -> UKOverviewEntry {
      getUpdatedOverviewEntry()
    }

    // get the actual data right now
    func getSnapshot(in context: Context, completion: @escaping (UKOverviewEntry) -> ()) {
        let entry = getUpdatedOverviewEntry()
        completion(entry)
    }

  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
      let date = Date()
      let entry = getUpdatedOverviewEntry()
      let nextUpdateDate = Calendar.current.date(byAdding: .minute, value: 15, to: date)!
      let timeline = Timeline(
          entries: [ entry ],
          policy: .after(nextUpdateDate)
      )
      completion(timeline)
  }
}

struct UKOverviewEntry: TimelineEntry {
  // always has a date as needs to know when to update
  let date: Date
  let totalPct: Double
}

struct UKOverviewEntryView : View {
    let entry: UKOverviewEntry
    let ukMap = UIImage(named: "uk-map")!

    var body: some View {
        ZStack(alignment: .top) {
            ContainerRelativeShape()
                .fill(
                    Color(
                        #colorLiteral(
                            red: 56.0 / 255.0,
                            green: 49.0 / 255.0,
                            blue: 140.0 / 255.0,
                            alpha: 1
                        )
                    )
                )
            
            VStack(alignment: .leading) {
                Spacer()
                
                HStack(alignment: .center) {
                    Spacer()
                    Image(uiImage: ukMap)
                        .resizable()
                        .scaledToFit()
                        .frame(height: 80)
                    Spacer()
                }
                Spacer()
            }
          
            GeometryReader { metrics in
            VStack(alignment: .leading) {
                  Spacer()
                  
                  RoundedRectangle(cornerRadius: 100)
                    .stroke(Color.white, lineWidth: 1)
                    .frame(width: metrics.size.width * ((entry.totalPct == 0 ? 100 : entry.totalPct) / 100), height: 11)
                    .padding(1)
                    .overlay(
                      RoundedRectangle(cornerRadius: 100)
                        .fill(
                          Color(
                            #colorLiteral(
                              red: 72.0 / 255.0,
                              green: 196.0 / 255.0,
                              blue: 34.0 / 255.0,
                              alpha: 1
                            )
                          )
                        )
                        .frame(height: 7)
                    )
                
              }
            }
            .padding(.bottom, 13)
            .padding(.horizontal, 20)
            
            VStack(alignment: .leading) {
                HStack {
                  Text("\(String(format: "%.0f", entry.totalPct))%")
                        .font(.system(size: 18, weight: .bold, design: .default))
                        .foregroundColor(.white)
                        //.padding(.top, 1)
                        //.multilineTextAlignment(.leading)
                        //.padding(.vertical, -16)
                    
                    Spacer()
                    
                    VStack(alignment: .leading) {
                        HStack {
                            Text(entry.date.dayOfMonthFormat())
                                .font(.system(size: 12))
                                .foregroundColor(.white)
                                .fontWeight(.bold)
                            
                            Text( entry.date.monthFormat())
                                .font(.system(size: 12))
                                .foregroundColor(.white)
                                .fontWeight(.bold)
                        }
                        .frame(maxWidth: .infinity, alignment: .trailing)
                        .padding(.top, 6)
                        
                        Text(entry.date.yearFormat())
                            .font(.system(size: 12))
                            .foregroundColor(.white)
                            .fontWeight(.bold)
                            .frame(maxWidth: .infinity, alignment: .trailing)
                        
                        
                    }.frame(alignment: .top)
                }.frame(alignment: .top).padding(.horizontal, 10)
                                
            }.frame(alignment: .top)
        }
    }
}

struct UKOverviewWidget: Widget {
    let kind: String = "UKOverviewWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            UKOverviewEntryView(entry: entry)
        }
        .configurationDisplayName("UK Overview")
        .description("The current UK renewable energy percentage.")
        .supportedFamilies([.systemSmall])
    }
}

struct UKOverviewWidget_Previews: PreviewProvider {
    static var previews: some View {
       let entry = getUpdatedOverviewEntry()
        UKOverviewEntryView(entry: entry)
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}

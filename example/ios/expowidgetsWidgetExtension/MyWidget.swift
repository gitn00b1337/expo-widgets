import WidgetKit
import SwiftUI

func getEntry() -> SimpleEntry {

    if let data = UserDefaults.standard.data(forKey: "MyData") {
        do {
            let decoder = JSONDecoder()
            let data = try decoder.decode(MyData.self, from: data)

            let entry = SimpleEntry(
                date: Date(),
                message: data.message
            )
            
            return entry
        } catch (let error) {
            //logger.error("An error occured decoding MyData: \(error.localizedDescription)")
        }
    }
    else {
        //logger.warn("No entry found MyData")
    }

    return SimpleEntry(
        date: Date(),
        message: "Placeholder. If this message appears in iOS, do you have a dev account set up correctly with signing permissions?"
    )
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        getEntry()
    }
    
    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = getEntry()
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let date = Date()
        let entry = getEntry()
        let nextUpdateDate = Calendar.current.date(byAdding: .minute, value: 15, to: date)!
        let timeline = Timeline(
            entries: [ entry ],
            policy: .after(nextUpdateDate)
        )
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let message: String
}

struct MyWidgetEntryView : View {
    var entry: Provider.Entry
    
    var body: some View {
        Text(entry.message)
    }
}

struct MyWidget: Widget {
    let kind: String = "MyWidgets"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            MyWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("My Widget")
        .description("This is my first widget.")
    }
}

struct MyWidget_Previews: PreviewProvider {
    static var previews: some View {
        let entry = getEntry()

        MyWidgetEntryView(entry: entry)
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
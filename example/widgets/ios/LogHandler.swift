
protocol LogHandler {
  func log(message: String)
}

public class MyLogHandler: LogHandler {
  func log(message: String) {
    print("ExpoWidgets: \(message)")
  }
}

public class Logger {
  private var logHandlers: [LogHandler]
  
  init(logHandlers: [LogHandler]) {
    self.logHandlers = logHandlers
  }
  
  func log(message: String) {
    for handler in logHandlers {
      handler.log(message: message)
    }
  }
}


export const getTemplate = () => 
`import ExpoModulesCore
// module.template.swift
// this file is a placeholder that gets overwritten by the module file provided by users (if they have one)

public class ExpoWidgetsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoWidgets")
  }
}
`
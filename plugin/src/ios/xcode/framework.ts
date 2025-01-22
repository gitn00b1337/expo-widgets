import { XcodeProject } from "expo/config-plugins"

export const addFrameworksToWidgetProject = (project: XcodeProject, target: { uuid: string }) => {
    const frameworks = ['WidgetKit.framework', 'SwiftUI.framework']
  
    for (const framework of frameworks) {
      project.addFramework(framework, {
        target: target.uuid,
        link: true,
      })
    }
  
    project.addBuildPhase(
      frameworks,
      'PBXFrameworksBuildPhase',
      'Frameworks',
      target.uuid
    )
  }
package expo.modules.widgets;

import android.content.Context
import android.content.SharedPreferences
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoWidgetsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoWidgets")

    Function("setWidgetData") { data: String -> 
      getPreferences().edit().putString("widgetdata", data).commit()
    }
  }

  private val context
  get() = requireNotNull(appContext.reactContext)

  private fun getPreferences(): SharedPreferences {
    return context.getSharedPreferences(context.packageName + ".widgetdata", Context.MODE_PRIVATE)
  }
}
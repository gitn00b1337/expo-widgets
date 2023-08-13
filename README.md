# expo-widgets

An expo module that allows you to make native widgets in iOS and android.

IMPORTANT: android support coming soon. Currently only iOS is supported. Live activities are frequentUpdates are yet to be tested. Data transfer between widgets works well.

# Installation

```npx expo install @bittingz/expo-widgets```

# Setup

1. Create a folder where you want to store your widget files.
2. In your plugins array (app.config.{js/ts} add:

```[
    "@bittingz/expo-widgets",
    {
        ios: {
            src: "./src/my/path/to/widgets",
            devTeamId: "your apple dev team ID",
            mode: "production",                        
            moduleDependencies: [],
            useLiveActivities: false,
            frequentUpdates: false,
        },                      
    }
],
```

3. Within your widget folder create a Module.swift file, Widget Bundle, and Widget file etc. See the example app for more information.
4. If you have any swift files you need to use within Module.swift, simply add them to the moduleDependencies array in your app.config. This is particularly useful for data models between the module and widget.
5. To share data between your app and widgets you can use a variety of methods, but the easiest way is to use UserPreferences. This plugin automatically handles it for you, so all you have to do is make sure to use a suiteName with the correct format. See the example project.
6. If you want to use custom fonts in your widget, use my expo-native-fonts package. See the example project for usage. 

## Running the example project

```
cd example
npm run prebuild 
npx expo run:ios
```

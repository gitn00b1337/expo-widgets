# expo-widgets

An expo module that allows you to make native widgets in iOS and android.

IMPORTANT: Android is now under testing. iOS is production ready. Live activities are frequentUpdates are yet to be tested. Data transfer between widgets works well.

# Installation

```npx expo install @bittingz/expo-widgets```

# Setup

See the example project for more clarity. You can omit the android or ios folders and setup if you only wish to support one platform.

1. Create a folder where you want to store your widget files.
2. In your plugins array (app.config.{js/ts} add:

```[
    "@bittingz/expo-widgets",
    {
        ios: {
            src: "./src/my/path/to/ios/widgets/folder",
            devTeamId: "your apple dev team ID",
            mode: "production",                        
            moduleDependencies: [],
            useLiveActivities: false,
            frequentUpdates: false,
        },
        android: {
            src: "./src/my/path/to/android/widgets/folder",
        }                      
    }
],
```

3. Within your iOS widget folder create a Module.swift file, Widget Bundle, Assets.xcassets, and Widget swift files.
4. Your android folder should mimic android studio setup, so it has two subfolder paths: /android/main/java/package_name and /android/res/.... The package_name is currently being worked on for adjusting the name. Inside you place your widget.kt files. The res folder should contain your assets, the same as in android studio.
5. If you have any swift files you need to use within Module.swift, simply add them to the moduleDependencies array in your app.config. This is particularly useful for data models between the module and widget.
6. To share data between your app and widgets you can use a variety of methods, but the easiest way is to use UserPreferences. This plugin automatically handles it for you, so all you have to do is make sure to use a suiteName with the correct format. See the example project.
7. If you want to use custom fonts in your widget, use my expo-native-fonts package. See the example project for usage. 

## Running the example project

```
cd example
npm run prebuild 
npx expo run:ios
```

# Need Custom Fonts?

Give my [other expo module a try](https://github.com/gitn00b1337/expo-native-fonts). You'll need to put the fonts config before the widgets config.

# Thanks!

A huge thanks to [gashimo](https://github.com/gaishimo/eas-widget-example) for a great baseline to start from. 

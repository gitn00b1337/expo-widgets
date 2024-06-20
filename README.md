# expo-widgets

An expo module that allows you to make native widgets in iOS and android.

# Installation

```npx expo install @bittingz/expo-widgets```

# Setup

See the example project for more clarity. You can omit the android or ios folders and setup if you only wish to support one platform.

1. Create a folder where you want to store your widget files.
2. In your plugins array (app.config.{js/ts} add:

```json
[
    "@bittingz/expo-widgets",
    {
        ios: {
            src: "./src/my/path/to/ios/widgets/folder",
            devTeamId: "your apple dev team ID",
            mode: "production",                        
            moduleDependencies: [],
            useLiveActivities: false,
            frequentUpdates: false,
            entitlements: {
                "any xcode entitlement the widget needs": "entitlement value"
            }
        },
        android: {
            src: "./src/my/path/to/android/widgets/folder",
            widgets: [
                {
                    "name": "MyWidgetProvider",
                    "resourceName": "@xml/my_widget_info"
                }
            ],
            distPlaceholder: "optional.placeholder"
        }                      
    }
],
```

3. Within your iOS widget folder create a Module.swift file, Widget Bundle, Assets.xcassets, and Widget swift files.
4. Your android folder should mimic android studio setup, so it has two subfolder paths: /android/main/java/package_name and /android/res/.... The package_name is currently being worked on for adjusting the name. Inside you place your widget.kt files. The res folder should contain your assets, the same as in android studio.
5. If you have any swift files you need to use within Module.swift, simply add them to the moduleDependencies array in your app.config. This is particularly useful for data models between the module and widget.
6. To share data between your app and widgets you can use a variety of methods, but the easiest way is to use `UserDefaults`. This plugin automatically handles it for you, so all you have to do is make sure to use a suiteName with the correct format. See the example project.
7. If you want to use custom fonts in your widget, use my expo-native-fonts package. See the example project for usage. 
8. For android, set resourceName to your file name in /res/xml/***_info.xml
9. For android apps which require multiple distributions with different package names you can use distPlaceholder which will replace all instances of the provided placeholder in widget source files with your app.config.(json/ts/js). So if your source files include "package com.company.app" and "import com.company.app" and you have two distributions (com.company.app for prod and dev.company.app for dev) then setting distPlaceholder to com.company.app will replace all package and import references to the correct distribution each build. You can omit this field if it's not relevant to you. iOS requires no configuration for multiple distribution apps.

# Overriding xcode options

If you need to override xcode options (such as handling a swift version mismatch) you can add the following:

```json
xcode: {
    configOverrides: {
        SWIFT_VERSION: '5.0',
    },                        
},
```

The configOverrides properties are the xcodeproj values and must match case exactly.

## Running the example project

```sh
cd example
npm run prebuild:ios
npm run ios
OR
npm run prebuild:android
npm run android
```

## Troubleshooting Android

If you use R in your widget kotlin file to get layouts, you may get an unresolved reference error for R. In this case, simply add "package your.appconfig.packageid.R", delete your android folder and rebuild.

## Need Custom Fonts?

Give my [other expo module a try](https://github.com/gitn00b1337/expo-native-fonts). You'll need to put the fonts config before the widgets config.

# Thanks!

A huge thanks to [gashimo](https://github.com/gaishimo/eas-widget-example) for a great baseline to start from. 

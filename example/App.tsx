import { Platform, StyleSheet, Text, View } from 'react-native';
import * as ExpoWidgetsModule from "@bittingz/expo-widgets"

export default function App() {
  if (Platform.OS === 'ios') {
    console.log('Setting data')
    ExpoWidgetsModule.setWidgetData({ message: 'Hello from app!' })
  }

  return (
    <View style={styles.container}>
      <Text>Example App!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

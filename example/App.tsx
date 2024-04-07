import { Platform, StyleSheet, Text, View } from 'react-native';
import * as ExpoWidgetsModule from '@bittingz/expo-widgets';

function getData() {
  if (Platform.OS === 'android') {
    return 'Hello android!';
  }
  else {
    var data = { message: 'Hello iOS!' };
    return JSON.stringify(data);
  }
}

export default function App() {
  if (Platform.OS === 'ios') {
    console.log('Setting data')
    const json = JSON.stringify({ message: 'Hello from app!' });
    ExpoWidgetsModule.setWidgetData(json)
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

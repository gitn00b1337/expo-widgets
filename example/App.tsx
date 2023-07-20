import { StyleSheet, Text, View } from 'react-native';

import * as ExpoWidgets from 'expo-widgets';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{ExpoWidgets.hello()}</Text>
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

import { StyleSheet, Text, View } from 'react-native';
import { ExpoWidgetsModule } from "@bittingz/expo-widgets"

export default function App() {
  ExpoWidgetsModule.setUKBreakdown({ message: 'Hello world!' })

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

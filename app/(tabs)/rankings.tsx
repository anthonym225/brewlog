import { View, Text, StyleSheet } from 'react-native';

export default function RankingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rankings</Text>
      <Text style={styles.subtitle}>Your leaderboards will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFAF5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3C2A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7B6B',
  },
});

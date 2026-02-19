import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="visit/[id]"
          options={{
            headerShown: true,
            title: 'Visit Details',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="cafe/[id]"
          options={{
            headerShown: true,
            title: 'Cafe',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  );
}

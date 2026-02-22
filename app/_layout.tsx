import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from '@/db/database';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error('Failed to initialize database:', err);
        // Set ready anyway so the app doesn't hang on a loading screen.
        setDbReady(true);
      });
  }, []);

  if (!dbReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFAF5',
        }}
      >
        <ActivityIndicator size="large" color="#8B5E3C" />
      </View>
    );
  }

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

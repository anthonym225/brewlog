require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

module.exports = {
  expo: {
    name: 'BrewLog',
    slug: 'brewlog',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'brewlog',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#F5E6D3',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.brewlog.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#F5E6D3',
      },
      edgeToEdgeEnabled: true,
      package: 'com.brewlog.app',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      'expo-sqlite',
      [
        'expo-image-picker',
        {
          photosPermission:
            'BrewLog needs access to your photos to add images to your cafe visits.',
          cameraPermission:
            'BrewLog needs access to your camera to take photos of cafes.',
        },
      ],
    ],
    extra: {
      googleMapsApiKey: process.env.GOOGLE_PLACES_API_KEY ?? '',
    },
  },
};

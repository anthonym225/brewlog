// Web stub for react-native-maps
// Provides no-op View components so the web bundle doesn't crash on native-only code.
const React = require('react');
const { View } = require('react-native');

function MapView({ children, style }) {
  return React.createElement(View, { style }, children);
}

function Marker({ children }) {
  return React.createElement(View, null, children);
}

function Callout({ children }) {
  return React.createElement(View, null, children);
}

module.exports = {
  default: MapView,
  MapView,
  Marker,
  Callout,
};

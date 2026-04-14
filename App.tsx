import React from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import { SettingsProvider } from './src/context/SettingsContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <HomeScreen />
      </ThemeProvider>
    </SettingsProvider>
  );
}

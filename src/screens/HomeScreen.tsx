import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import WindWidget from '../components/WindWidget';
import ResWidget from '../components/ResWidget';

export default function HomeScreen() {
  const { isDark, colors: c, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={c.background}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28,
        }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: '900', color: c.text, letterSpacing: -0.5 }}>
              KITE UP
            </Text>
            <Text style={{ fontSize: 13, color: c.subtext, marginTop: 2 }}>
              Your kitesurf companion
            </Text>
          </View>

          {/* Dark / Light toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.8}
            style={{
              width: 56,
              height: 30,
              borderRadius: 15,
              backgroundColor: isDark ? c.accent : c.toggleBg,
              justifyContent: 'center',
              padding: 3,
            }}
          >
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: isDark ? 'flex-end' : 'flex-start',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2,
            }}>
              <Text style={{ fontSize: 13 }}>{isDark ? '🌙' : '☀️'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Wind Widget */}
        <WindWidget />

        {/* Res Widget */}
        <ResWidget />

        {/* Bottom spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { SPOTS } from '../services/windService';

interface Props {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: Props) {
  const { isDark, colors: c } = useTheme();
  const { selectedLocations, minKnots, toggleLocation, selectAll, setMinKnots } = useSettings();

  const allSelected = selectedLocations.length === SPOTS.length;

  const adjust = (delta: number) => setMinKnots(minKnots + delta);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={c.background} />

      {/* ── Header ── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: c.border,
      }}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 20,
            backgroundColor: c.accentLight,
            borderWidth: 1,
            borderColor: c.accent,
            marginRight: 16,
          }}
        >
          <Text style={{ fontSize: 16, color: c.accent }}>‹</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: c.accent }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '900', color: c.text }}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

        {/* ── Locations ── */}
        <View style={{
          backgroundColor: c.card,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: c.border,
          shadowColor: c.cardShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 4,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 2, color: c.accent, textTransform: 'uppercase', marginBottom: 2 }}>
                Locations
              </Text>
              <Text style={{ fontSize: 13, color: c.subtext }}>
                {selectedLocations.length} of {SPOTS.length} selected
              </Text>
            </View>

            {/* Select All / Deselect All toggle */}
            <TouchableOpacity
              onPress={allSelected
                ? () => { /* keep at least one — handled in context */ }
                : selectAll}
              activeOpacity={0.75}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: allSelected ? c.accent : c.accentLight,
                borderWidth: 1.5,
                borderColor: c.accent,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: allSelected ? '#fff' : c.accent }}>
                {allSelected ? 'All Selected' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Location list */}
          {SPOTS.map((spot, i) => {
            const isChecked = selectedLocations.includes(i);
            return (
              <TouchableOpacity
                key={i}
                onPress={() => toggleLocation(i)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 13,
                  borderBottomWidth: i < SPOTS.length - 1 ? 1 : 0,
                  borderBottomColor: c.border,
                  gap: 14,
                }}
              >
                {/* Checkbox */}
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  borderWidth: 2,
                  borderColor: isChecked ? c.accent : c.border,
                  backgroundColor: isChecked ? c.accent : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {isChecked && (
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900', lineHeight: 18 }}>✓</Text>
                  )}
                </View>

                {/* Name */}
                <Text style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: isChecked ? '700' : '400',
                  color: isChecked ? c.text : c.subtext,
                }}>
                  {spot.name}
                </Text>

                {/* Index badge */}
                <View style={{
                  width: 22, height: 22, borderRadius: 11,
                  backgroundColor: c.border,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: c.subtext }}>{i + 1}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Minimum Knots ── */}
        <View style={{
          backgroundColor: c.card,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: c.border,
          shadowColor: c.cardShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 4,
        }}>
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 2, color: c.wind, textTransform: 'uppercase', marginBottom: 4 }}>
            Minimum Wind
          </Text>
          <Text style={{ fontSize: 13, color: c.subtext, marginBottom: 20 }}>
            Spots below this value will be flagged
          </Text>

          {/* Stepper */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            {/* − button */}
            <TouchableOpacity
              onPress={() => adjust(-1)}
              activeOpacity={0.7}
              disabled={minKnots <= 0}
              style={{
                width: 48, height: 48, borderRadius: 24,
                backgroundColor: minKnots <= 0 ? c.border : c.wind + '22',
                borderWidth: 2,
                borderColor: minKnots <= 0 ? c.border : c.wind,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: '700', color: minKnots <= 0 ? c.subtext : c.wind, lineHeight: 28 }}>−</Text>
            </TouchableOpacity>

            {/* Value display + direct input */}
            <View style={{ alignItems: 'center', minWidth: 80 }}>
              <TextInput
                value={String(minKnots)}
                onChangeText={t => {
                  const n = parseInt(t, 10);
                  if (!isNaN(n)) setMinKnots(n);
                }}
                keyboardType="number-pad"
                style={{
                  fontSize: 48,
                  fontWeight: '900',
                  color: c.wind,
                  textAlign: 'center',
                  width: 90,
                  padding: 0,
                }}
                maxLength={2}
              />
              <Text style={{ fontSize: 12, fontWeight: '600', color: c.subtext, marginTop: -4 }}>knots</Text>
            </View>

            {/* + button */}
            <TouchableOpacity
              onPress={() => adjust(1)}
              activeOpacity={0.7}
              disabled={minKnots >= 40}
              style={{
                width: 48, height: 48, borderRadius: 24,
                backgroundColor: minKnots >= 40 ? c.border : c.wind + '22',
                borderWidth: 2,
                borderColor: minKnots >= 40 ? c.border : c.wind,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: '700', color: minKnots >= 40 ? c.subtext : c.wind, lineHeight: 28 }}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Range bar */}
          <View style={{ marginTop: 24 }}>
            <View style={{
              height: 6, borderRadius: 3,
              backgroundColor: c.border,
              overflow: 'hidden',
            }}>
              <View style={{
                height: '100%',
                width: `${(minKnots / 40) * 100}%`,
                backgroundColor: c.wind,
                borderRadius: 3,
              }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ fontSize: 10, color: c.subtext }}>0</Text>
              <Text style={{ fontSize: 10, color: c.subtext }}>20</Text>
              <Text style={{ fontSize: 10, color: c.subtext }}>40</Text>
            </View>

            {/* Quick-set presets */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              {[0, 10, 15, 20, 25].map(v => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setMinKnots(v)}
                  activeOpacity={0.75}
                  style={{
                    flex: 1,
                    paddingVertical: 7,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: minKnots === v ? c.wind : c.accentLight,
                    borderWidth: 1,
                    borderColor: minKnots === v ? c.wind : c.border,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: minKnots === v ? '#fff' : c.subtext }}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

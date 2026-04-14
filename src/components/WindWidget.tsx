import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface WindForecast {
  time: string;
  speed: number;
  direction: string;
  gust: number;
}

interface SpotData {
  name: string;
  distance: string;
  forecast: WindForecast[];
}

function windQuality(speed: number): { label: string; color: string } {
  if (speed < 10) return { label: 'Too Light', color: '#FFA502' };
  if (speed < 16) return { label: 'Light', color: '#2ED573' };
  if (speed < 22) return { label: 'Ideal', color: '#00B4D8' };
  if (speed < 28) return { label: 'Strong', color: '#FF6348' };
  return { label: 'Extreme', color: '#FF4757' };
}

const MOCK_SPOT: SpotData = {
  name: 'Tarifa Beach',
  distance: '2.3 km',
  forecast: [
    { time: 'Now',   speed: 18, direction: 'SW', gust: 22 },
    { time: '15:00', speed: 20, direction: 'SW', gust: 25 },
    { time: '18:00', speed: 23, direction: 'W',  gust: 28 },
    { time: '21:00', speed: 16, direction: 'W',  gust: 19 },
  ],
};

export default function WindWidget() {
  const { colors } = useTheme();
  const [spot, setSpot] = useState<SpotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHour, setSelectedHour] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSpot(MOCK_SPOT);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={[styles.card(colors), { alignItems: 'center', justifyContent: 'center', minHeight: 180 }]}>
        <ActivityIndicator size="large" color={colors.wind} />
        <Text style={{ color: colors.subtext, marginTop: 8, fontSize: 13 }}>Locating nearest spot...</Text>
      </View>
    );
  }

  if (!spot) return null;
  const current = spot.forecast[selectedHour];
  const quality = windQuality(current.speed);

  return (
    <View style={styles.card(colors)}>
      <View style={styles.header}>
        <View>
          <Text style={styles.widgetLabel(colors)}>Wind</Text>
          <Text style={styles.spotName(colors)}>{spot.name}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.windLight }]}>
          <Text style={{ color: colors.wind, fontSize: 12, fontWeight: '600' }}>{spot.distance}</Text>
        </View>
      </View>

      <View style={styles.mainWind}>
        <Text style={styles.windSpeed(colors)}>{current.speed}</Text>
        <Text style={styles.windUnit(colors)}>kts</Text>
        <View style={{ marginLeft: 'auto', alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{current.direction}</Text>
          <Text style={{ fontSize: 13, color: colors.subtext, marginTop: 2 }}>Gust {current.gust} kts</Text>
        </View>
      </View>

      <View style={[styles.qualityBadge, { backgroundColor: quality.color }]}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{quality.label}</Text>
      </View>

      <Text style={styles.forecastLabel(colors)}>Forecast</Text>
      <View style={styles.forecastRow}>
        {spot.forecast.map((f, i) => {
          const q = windQuality(f.speed);
          const isSelected = i === selectedHour;
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.forecastPill,
                {
                  backgroundColor: isSelected ? colors.windLight : colors.background,
                  borderColor: isSelected ? colors.wind : colors.border,
                },
              ]}
              onPress={() => setSelectedHour(i)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', marginBottom: 4, color: isSelected ? colors.wind : colors.subtext }}>
                {f.time}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: q.color }}>{f.speed}</Text>
              <Text style={{ fontSize: 11, color: colors.subtext, marginTop: 2 }}>{f.direction}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = {
  card: (c: any) => ({
    backgroundColor: c.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: c.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: c.border,
  }),
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  widgetLabel: (c: any) => ({
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 2,
    color: c.wind,
    textTransform: 'uppercase' as const,
  }),
  spotName: (c: any) => ({
    fontSize: 20,
    fontWeight: '800' as const,
    color: c.text,
    marginTop: 2,
  }),
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  mainWind: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    marginBottom: 12,
  },
  windSpeed: (c: any) => ({
    fontSize: 56,
    fontWeight: '900' as const,
    color: c.wind,
    lineHeight: 60,
  }),
  windUnit: (c: any) => ({
    fontSize: 16,
    fontWeight: '600' as const,
    color: c.subtext,
    marginBottom: 8,
    marginLeft: 4,
  }),
  qualityBadge: {
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
  },
  forecastLabel: (c: any) => ({
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
    color: c.subtext,
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  }),
  forecastRow: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  forecastPill: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center' as const,
    borderWidth: 1.5,
  },
};

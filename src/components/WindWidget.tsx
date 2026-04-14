import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { fetchAllSpotsWind, degreesToDirection, SpotWind } from '../services/windService';

function windQuality(speed: number): { label: string; color: string } {
  if (speed < 10) return { label: 'Too Light', color: '#FFA502' };
  if (speed < 16) return { label: 'Light',     color: '#2ED573' };
  if (speed < 22) return { label: 'Ideal',     color: '#00B4D8' };
  if (speed < 28) return { label: 'Strong',    color: '#FF6348' };
  return             { label: 'Extreme',   color: '#FF4757' };
}

function formatHour(date: Date): string {
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function WindWidget() {
  const { colors: c } = useTheme();
  const [spots, setSpots] = useState<SpotWind[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSpot, setActiveSpot] = useState(0);
  const [activeHour, setActiveHour] = useState(0);

  useEffect(() => {
    fetchAllSpotsWind()
      .then(data => { setSpots(data); setLoading(false); })
      .catch(e => { setError('Could not load wind data'); setLoading(false); console.error(e); });
  }, []);

  const cardStyle = {
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
  };

  if (loading) {
    return (
      <View style={[cardStyle, { alignItems: 'center' as const, justifyContent: 'center' as const, minHeight: 180 }]}>
        <ActivityIndicator size="large" color={c.wind} />
        <Text style={{ color: c.subtext, marginTop: 8, fontSize: 13 }}>Fetching wind data...</Text>
      </View>
    );
  }

  if (error || spots.length === 0) {
    return (
      <View style={[cardStyle, { alignItems: 'center' as const, justifyContent: 'center' as const, minHeight: 120 }]}>
        <Text style={{ color: c.danger, fontSize: 14, fontWeight: '600' }}>{error ?? 'No data'}</Text>
      </View>
    );
  }

  const spot = spots[activeSpot];
  const hourData = spot.forecast[activeHour] ?? spot.forecast[0];
  const quality = windQuality(hourData.speed);
  const direction = degreesToDirection(spot.currentDirection);

  return (
    <View style={cardStyle}>
      {/* Widget label */}
      <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 2, color: c.wind, textTransform: 'uppercase', marginBottom: 12 }}>
        Wind
      </Text>

      {/* Spot selector — horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {spots.map((s, i) => {
          const q = windQuality(s.currentSpeed);
          const isActive = i === activeSpot;
          return (
            <TouchableOpacity
              key={s.name}
              onPress={() => { setActiveSpot(i); setActiveHour(0); }}
              activeOpacity={0.75}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1.5,
                backgroundColor: isActive ? c.windLight : c.background,
                borderColor: isActive ? c.wind : c.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: q.color }} />
              <Text style={{ fontSize: 13, fontWeight: isActive ? '700' : '500', color: isActive ? c.wind : c.subtext }}>
                {s.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main wind display */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 }}>
        <Text style={{ fontSize: 56, fontWeight: '900', color: c.wind, lineHeight: 60 }}>
          {hourData.speed}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: c.subtext, marginBottom: 8, marginLeft: 4 }}>
          kts
        </Text>
        <View style={{ marginLeft: 'auto', alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>{direction}</Text>
          <Text style={{ fontSize: 13, color: c.subtext, marginTop: 2 }}>
            {spot.currentDirection}°
          </Text>
        </View>
      </View>

      {/* Quality badge */}
      <View style={{
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: quality.color,
        marginBottom: 16,
      }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{quality.label}</Text>
      </View>

      {/* Hourly forecast */}
      <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: c.subtext, textTransform: 'uppercase', marginBottom: 10 }}>
        Hourly Forecast
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {spot.forecast.map((f, i) => {
          const q = windQuality(f.speed);
          const isSel = i === activeHour;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setActiveHour(i)}
              activeOpacity={0.75}
              style={{
                width: 62,
                borderRadius: 14,
                paddingVertical: 10,
                alignItems: 'center',
                borderWidth: 1.5,
                backgroundColor: isSel ? c.windLight : c.background,
                borderColor: isSel ? c.wind : c.border,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '600', marginBottom: 4, color: isSel ? c.wind : c.subtext }}>
                {formatHour(f.time)}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: q.color }}>{f.speed}</Text>
              <Text style={{ fontSize: 10, color: c.subtext, marginTop: 2 }}>kts</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import {
  fetchAllSpotsWind,
  degreesToDirection,
  SpotWind,
  DayForecast,
  HourForecast,
} from '../services/windService';
import WindArrow from './WindArrow';

// ── Constants ────────────────────────────────────────────────────────────────

const DAILY_CARD_W  = 70;
const DAILY_GAP     = 8;
const DAILY_STRIDE  = DAILY_CARD_W + DAILY_GAP;

const HOURLY_CARD_W = 60;
const HOURLY_GAP    = 8;
const HOURLY_STRIDE = HOURLY_CARD_W + HOURLY_GAP;

const ARROW_SIZE = 86;

// ── Helpers ──────────────────────────────────────────────────────────────────

function windQuality(speed: number): { label: string; color: string } {
  if (speed < 10) return { label: 'Too Light', color: '#FFA502' };
  if (speed < 16) return { label: 'Light',     color: '#2ED573' };
  if (speed < 22) return { label: 'Ideal',     color: '#00B4D8' };
  if (speed < 28) return { label: 'Strong',    color: '#FF6348' };
  return             { label: 'Extreme',   color: '#FF4757' };
}

const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDay(date: Date): string {
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}
function fmtHour(date: Date): string {
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// ── LinkedForecast ────────────────────────────────────────────────────────────
// Arrow on the left, scroll on the right — arrow tracks leftmost visible card.

interface LinkedForecastProps {
  mode: 'daily';
  days: DayForecast[];
  colors: any;
  onSelectDay: (idx: number) => void;
}

interface LinkedHourlyProps {
  mode: 'hourly';
  hours: HourForecast[];
  colors: any;
  dayLabel: string;
  onBack: () => void;
}

type LinkedProps = LinkedForecastProps | LinkedHourlyProps;

function LinkedForecast(props: LinkedProps) {
  const { colors } = props;
  const [arrowIdx, setArrowIdx] = useState(0);

  // Reset arrow to first card whenever the data set changes
  const listKey = props.mode === 'daily'
    ? props.days.length
    : (props as LinkedHourlyProps).hours.length;

  useEffect(() => { setArrowIdx(0); }, [listKey]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x      = e.nativeEvent.contentOffset.x;
    const stride = props.mode === 'daily' ? DAILY_STRIDE : HOURLY_STRIDE;
    const idx    = Math.min(
      Math.round(x / stride),
      props.mode === 'daily'
        ? props.days.length - 1
        : (props as LinkedHourlyProps).hours.length - 1,
    );
    if (idx >= 0) setArrowIdx(idx);
  };

  // Data for arrow
  const arrowSpeed = props.mode === 'daily'
    ? props.days[arrowIdx]?.maxSpeed ?? 0
    : (props as LinkedHourlyProps).hours[arrowIdx]?.speed ?? 0;

  const arrowDir = props.mode === 'daily'
    ? props.days[arrowIdx]?.dominantDirection ?? 0
    : (props as LinkedHourlyProps).hours[arrowIdx]?.direction ?? 0;

  const arrowColor = windQuality(arrowSpeed).color;

  // Header row (back button + label for hourly)
  const header = props.mode === 'hourly' ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <TouchableOpacity
        onPress={(props as LinkedHourlyProps).onBack}
        activeOpacity={0.7}
        style={{
          paddingVertical: 4, paddingHorizontal: 10,
          backgroundColor: colors.resLight, borderRadius: 20,
          borderWidth: 1, borderColor: colors.res, marginRight: 10,
        }}
      >
        <Text style={{ color: colors.res, fontSize: 13, fontWeight: '700' }}>← Daily</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
        {(props as LinkedHourlyProps).dayLabel}
      </Text>
    </View>
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.subtext, textTransform: 'uppercase' }}>
        14-Day Forecast
      </Text>
      <Text style={{ fontSize: 10, color: colors.subtext }}>Tap day → hourly</Text>
    </View>
  );

  return (
    <View>
      {header}

      {/* Arrow + scroll row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>

        {/* Arrow — fixed, reflects leftmost card */}
        <View style={{
          width: ARROW_SIZE,
          height: ARROW_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          backgroundColor: arrowColor + '18',
          borderWidth: 1.5,
          borderColor: arrowColor + '55',
        }}>
          <WindArrow
            speedKnots={arrowSpeed}
            directionDeg={arrowDir}
            color={arrowColor}
            size={ARROW_SIZE}
          />
        </View>

        {/* Forecast scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: props.mode === 'daily' ? DAILY_GAP : HOURLY_GAP }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {props.mode === 'daily'
            ? props.days.map((d, i) => {
                const q = windQuality(d.maxSpeed);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => (props as LinkedForecastProps).onSelectDay(i)}
                    activeOpacity={0.75}
                    style={{
                      width: DAILY_CARD_W,
                      borderRadius: 14,
                      paddingVertical: 10,
                      paddingHorizontal: 4,
                      alignItems: 'center',
                      borderWidth: 1.5,
                      backgroundColor: colors.background,
                      borderColor: i === arrowIdx ? q.color : colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.subtext }}>
                      {DAY_NAMES[d.date.getDay()]}
                    </Text>
                    <Text style={{ fontSize: 9, color: colors.subtext, marginBottom: 6 }}>
                      {d.date.getDate()} {MONTH_SHORT[d.date.getMonth()]}
                    </Text>
                    <View style={{
                      width: 34, height: 34, borderRadius: 17,
                      backgroundColor: q.color + '22',
                      alignItems: 'center', justifyContent: 'center',
                      marginBottom: 4,
                    }}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: q.color }}>{d.maxSpeed}</Text>
                    </View>
                    <Text style={{ fontSize: 8, fontWeight: '700', color: q.color }}>{q.label}</Text>
                  </TouchableOpacity>
                );
              })
            : (props as LinkedHourlyProps).hours.map((h, i) => {
                const q = windQuality(h.speed);
                return (
                  <View
                    key={i}
                    style={{
                      width: HOURLY_CARD_W,
                      borderRadius: 14,
                      paddingVertical: 10,
                      alignItems: 'center',
                      borderWidth: 1.5,
                      backgroundColor: colors.background,
                      borderColor: i === arrowIdx ? q.color : colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '600', color: colors.subtext, marginBottom: 4 }}>
                      {fmtHour(h.time)}
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: q.color }}>{h.speed}</Text>
                    <Text style={{ fontSize: 9, color: colors.subtext, marginTop: 2 }}>kts</Text>
                  </View>
                );
              })
          }
        </ScrollView>
      </View>
    </View>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────────

export default function WindWidget() {
  const { colors: c } = useTheme();
  const [spots, setSpots]           = useState<SpotWind[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [activeSpot, setActiveSpot] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetchAllSpotsWind()
      .then(data => { setSpots(data); setLoading(false); })
      .catch(e => {
        console.error(e);
        setError('Could not load wind data');
        setLoading(false);
      });
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
      <View style={[cardStyle, { alignItems: 'center' as const, justifyContent: 'center' as const, minHeight: 200 }]}>
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

  const spot    = spots[activeSpot];
  const quality = windQuality(spot.currentSpeed);
  const dirLabel = degreesToDirection(spot.currentDirection);

  const selectedDayData = selectedDay !== null ? spot.daily[selectedDay] : null;
  const dayHours: HourForecast[] = selectedDay !== null
    ? spot.hourly.filter(h => {
        const d = spot.daily[selectedDay].date;
        return (
          h.time.getFullYear() === d.getFullYear() &&
          h.time.getMonth()    === d.getMonth() &&
          h.time.getDate()     === d.getDate()
        );
      })
    : [];

  return (
    <View style={cardStyle}>
      {/* Label */}
      <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 2, color: c.wind, textTransform: 'uppercase', marginBottom: 12 }}>
        Wind
      </Text>

      {/* Spot selector */}
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
              onPress={() => { setActiveSpot(i); setSelectedDay(null); }}
              activeOpacity={0.75}
              style={{
                paddingHorizontal: 14, paddingVertical: 8,
                borderRadius: 20, borderWidth: 1.5,
                backgroundColor: isActive ? c.windLight : c.background,
                borderColor: isActive ? c.wind : c.border,
                flexDirection: 'row', alignItems: 'center', gap: 6,
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

      {/* Current conditions */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 }}>
        <Text style={{ fontSize: 56, fontWeight: '900', color: c.wind, lineHeight: 60 }}>
          {spot.currentSpeed}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: c.subtext, marginBottom: 8, marginLeft: 4 }}>
          kts
        </Text>
        <Text style={{ fontSize: 13, color: c.subtext, marginBottom: 10, marginLeft: 10 }}>
          From {dirLabel} · {spot.currentDirection}°
        </Text>
      </View>

      {/* Quality badge */}
      <View style={{
        alignSelf: 'flex-start',
        paddingHorizontal: 14, paddingVertical: 5,
        borderRadius: 20, backgroundColor: quality.color, marginBottom: 20,
      }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{quality.label}</Text>
      </View>

      {/* Forecast: arrow linked to scroll */}
      {selectedDay === null ? (
        <LinkedForecast
          mode="daily"
          days={spot.daily}
          colors={c}
          onSelectDay={idx => setSelectedDay(idx)}
        />
      ) : (
        <LinkedForecast
          mode="hourly"
          hours={dayHours}
          colors={c}
          dayLabel={selectedDayData ? fmtDay(selectedDayData.date) : ''}
          onBack={() => setSelectedDay(null)}
        />
      )}
    </View>
  );
}

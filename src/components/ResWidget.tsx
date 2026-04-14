import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const SESSIONS = [
  { time: '09:00', label: 'Morning',   spots: 3 },
  { time: '12:00', label: 'Midday',    spots: 5 },
  { time: '15:00', label: 'Afternoon', spots: 2 },
  { time: '17:00', label: 'Sunset',    spots: 4 },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function Row({ label, value, colors, last = false }: { label: string; value: string; colors: any; last?: boolean }) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: colors.border,
    }}>
      <Text style={{ fontSize: 14, color: colors.subtext }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{value}</Text>
    </View>
  );
}

export default function ResWidget() {
  const { colors: c } = useTheme();
  const today = new Date();

  const [calOpen, setCalOpen] = useState(false);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [step, setStep] = useState<'calendar' | 'session' | 'confirm'>('calendar');

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const closeModal = () => {
    setCalOpen(false);
    setStep('calendar');
    setSelectedDay(null);
    setSelectedSession(null);
    setConfirmed(false);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(closeModal, 2500);
  };

  const session = selectedSession !== null ? SESSIONS[selectedSession] : null;

  return (
    <>
      <View style={{
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
      }}>
        <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 2, color: c.res, textTransform: 'uppercase', marginBottom: 6 }}>
          Reservations
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, marginBottom: 4 }}>
          Kitesurf School
        </Text>
        <Text style={{ fontSize: 13, color: c.subtext, marginBottom: 20 }}>
          Book your next session with a certified instructor
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Beginner',     color: c.success },
            { label: 'Intermediate', color: c.warning },
            { label: 'Advanced',     color: c.danger },
          ].map((level) => (
            <View key={level.label} style={{
              flex: 1,
              backgroundColor: level.color + '22',
              borderRadius: 12,
              paddingVertical: 8,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: level.color + '55',
            }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: level.color }}>{level.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setCalOpen(true)}
          activeOpacity={0.85}
          style={{
            backgroundColor: c.res,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>Book a Session</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={calOpen} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: c.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 24,
            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            maxHeight: '90%',
          }}>
            {/* Handle bar */}
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginBottom: 20 }} />

            {step !== 'calendar' && !confirmed && (
              <TouchableOpacity
                onPress={() => step === 'session' ? setStep('calendar') : setStep('session')}
                style={{ marginBottom: 12 }}
              >
                <Text style={{ color: c.res, fontSize: 14, fontWeight: '600' }}>Back</Text>
              </TouchableOpacity>
            )}

            {/* STEP 1: Calendar */}
            {step === 'calendar' && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <TouchableOpacity onPress={prevMonth} style={{ padding: 8 }}>
                    <Text style={{ fontSize: 24, color: c.res, fontWeight: '700' }}>‹</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>
                    {MONTHS[month]} {year}
                  </Text>
                  <TouchableOpacity onPress={nextMonth} style={{ padding: 8 }}>
                    <Text style={{ fontSize: 24, color: c.res, fontWeight: '700' }}>›</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                  {DAYS.map(d => (
                    <View key={d} style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: c.subtext }}>{d}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <View key={`e${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday =
                      day === today.getDate() &&
                      month === today.getMonth() &&
                      year === today.getFullYear();
                    const isPast =
                      new Date(year, month, day) <
                      new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const isSel = day === selectedDay;
                    return (
                      <TouchableOpacity
                        key={day}
                        disabled={isPast}
                        onPress={() => { setSelectedDay(day); setStep('session'); }}
                        style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <View style={{
                          width: 36, height: 36, borderRadius: 18,
                          alignItems: 'center', justifyContent: 'center',
                          backgroundColor: isSel ? c.res : isToday ? c.resLight : 'transparent',
                        }}>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: isToday || isSel ? '800' : '500',
                            color: isSel ? '#fff' : isPast ? c.border : isToday ? c.res : c.text,
                          }}>
                            {day}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* STEP 2: Session picker */}
            {step === 'session' && (
              <>
                <Text style={{ fontSize: 18, fontWeight: '800', color: c.text, marginBottom: 4 }}>Choose a Session</Text>
                <Text style={{ fontSize: 13, color: c.subtext, marginBottom: 20 }}>
                  {selectedDay} {MONTHS[month]} {year}
                </Text>
                <ScrollView>
                  {SESSIONS.map((s, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => { setSelectedSession(i); setStep('confirm'); }}
                      activeOpacity={0.8}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: c.background,
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 10,
                        borderWidth: 1.5,
                        borderColor: c.border,
                      }}
                    >
                      <View style={{
                        backgroundColor: c.resLight,
                        borderRadius: 10,
                        width: 52,
                        height: 52,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 14,
                      }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: c.res }}>{s.time}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>{s.label}</Text>
                        <Text style={{ fontSize: 12, color: c.subtext, marginTop: 2 }}>{s.spots} spots available</Text>
                      </View>
                      <View style={{
                        backgroundColor: s.spots <= 2 ? '#FF475722' : '#2ED57322',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 10,
                      }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: s.spots <= 2 ? c.danger : c.success }}>
                          {s.spots <= 2 ? 'Almost Full' : 'Available'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* STEP 3: Confirm */}
            {step === 'confirm' && session && !confirmed && (
              <>
                <Text style={{ fontSize: 18, fontWeight: '800', color: c.text, marginBottom: 20 }}>Confirm Booking</Text>
                <View style={{
                  backgroundColor: c.background,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: c.border,
                }}>
                  <Row label="Date"             value={`${selectedDay} ${MONTHS[month]} ${year}`} colors={c} />
                  <Row label="Session"          value={session.label}  colors={c} />
                  <Row label="Time"             value={session.time}   colors={c} />
                  <Row label="Available spots"  value={`${session.spots}`} colors={c} last />
                </View>
                <TouchableOpacity
                  onPress={handleConfirm}
                  style={{ backgroundColor: c.res, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>Confirm Reservation</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Confirmed */}
            {confirmed && (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>🎉</Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: c.text, marginBottom: 8 }}>Booked!</Text>
                <Text style={{ fontSize: 14, color: c.subtext, textAlign: 'center' }}>
                  Your session is confirmed.{'\n'}See you on the water!
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

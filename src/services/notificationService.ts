import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { SpotWind } from './windService';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function ordinal(n: number): string {
  if (n >= 11 && n <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

function formatDate(date: Date): string {
  // "18th of December Saturday"
  return `${ordinal(date.getDate())} of ${MONTHS[date.getMonth()]} ${DAYS[date.getDay()]}`;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('wind-alerts', {
      name: 'Wind Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleWindNotifications(
  selectedLocations: number[],
  spots: SpotWind[],
): Promise<void> {
  // Always cancel previous scheduled wind notifications before re-scheduling
  await Notifications.cancelAllScheduledNotificationsAsync();

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  for (const idx of selectedLocations) {
    const spot = spots[idx];
    if (!spot || !spot.daily[0]) continue;

    const today     = spot.daily[0];
    const dateLabel = formatDate(today.date);
    const body      = `At ${spot.name}, the wind is ${today.maxSpeed} knots in ${dateLabel}! Make a reservation!`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🪁 Kite Up! Wind Alert',
        body,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 10,
        minute: 15,
      },
    });
  }
}

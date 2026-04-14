import { fetchWeatherApi } from 'openmeteo';

export interface SpotWind {
  name: string;
  lat: number;
  lon: number;
  currentSpeed: number;   // knots
  currentDirection: number; // degrees
  forecast: { time: Date; speed: number }[];
}

const SPOTS = [
  { name: 'Alaçatı',    lat: 38.3229, lon: 26.7640 },
  { name: 'Urla',       lat: 38.2825, lon: 26.3746 },
  { name: 'Ayvalık',    lat: 39.3193, lon: 26.6934 },
  { name: 'Gökçeada',   lat: 40.2011, lon: 25.9090 },
  { name: 'Çanakkale',  lat: 40.1555, lon: 26.4127 },
  { name: 'Kumköy',     lat: 41.2454, lon: 29.0401 },
  { name: 'Bodrum',     lat: 37.0383, lon: 27.4292 },
  { name: 'Akyaka',     lat: 36.9081, lon: 30.6956 },
  { name: 'Yumrutalık', lat: 37.0572, lon: 28.3263 },
  { name: 'Antalya',    lat: 36.7686, lon: 35.7894 },
];

function degreesToDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export { degreesToDirection, SPOTS };

export async function fetchAllSpotsWind(): Promise<SpotWind[]> {
  const params = {
    latitude:  SPOTS.map(s => s.lat),
    longitude: SPOTS.map(s => s.lon),
    hourly: ['wind_speed_10m', 'wind_direction_10m'],
    timezone: 'Europe/Istanbul',
    wind_speed_unit: 'kn',
    forecast_days: 1,
  };

  const responses = await fetchWeatherApi(
    'https://api.open-meteo.com/v1/forecast',
    params,
  );

  return responses.map((response, i) => {
    const utcOffset = response.utcOffsetSeconds();
    const hourly = response.hourly()!;
    const times = Array.from(
      { length: (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval() },
      (_, j) => new Date((Number(hourly.time()) + j * hourly.interval() + utcOffset) * 1000),
    );
    const speeds     = Array.from(hourly.variables(0)!.valuesArray()!);
    const directions = Array.from(hourly.variables(1)!.valuesArray()!);

    // Find the index closest to now
    const now = Date.now();
    const nowIdx = times.reduce((best, t, j) =>
      Math.abs(t.getTime() - now) < Math.abs(times[best].getTime() - now) ? j : best, 0);

    return {
      name: SPOTS[i].name,
      lat:  SPOTS[i].lat,
      lon:  SPOTS[i].lon,
      currentSpeed:     Math.round(speeds[nowIdx]),
      currentDirection: Math.round(directions[nowIdx]),
      forecast: times.slice(nowIdx, nowIdx + 6).map((t, j) => ({
        time:  t,
        speed: Math.round(speeds[nowIdx + j]),
      })),
    };
  });
}

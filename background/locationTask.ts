
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { formatDateToISO, formatTime } from '@/utils';
import { calculateDistance } from '@/utils/geoUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
/* import * as Notifications from 'expo-notifications'; */


/* let lastNotificationUpdate = 0;
const NOTIFICATION_UPDATE_INTERVAL = 10; // em segundos
let notificationId: string | null = null; */


/* const shouldUpdateNotification = () => {
  const now = Math.floor(Date.now() / 1000);
  if (now - lastNotificationUpdate >= NOTIFICATION_UPDATE_INTERVAL) {
    lastNotificationUpdate = now;
    return true;
  }
  return false;
}; */

/* const showRunningNotification = async (distance: number, time: number, calories: number) => {
  // Cancela a notificação anterior, se houver
  if (notificationId) {
    await Notifications.dismissNotificationAsync(notificationId);
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🏃 Corrida em andamento',
      body: `📏 Distância: ${distance.toFixed(2)} km\n⏳ Tempo: ${formatTime(time)} min\n🔥 Calorias: ${calories.toFixed(1)} kcal`,
      sound: true,
      sticky: false, // Apenas no Android, para notificações persistentes
    },
    trigger: null,
  });

  notificationId = id;
}; */

const BACKGROUND_LOCATION_TASK = 'background-location-task';
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Erro na task de localização em background:', error);
    return;
  }
  const minDistance = 0.001;
  const { locations } = data as any;
  if (locations && locations.length > 0) {
    const location = locations[0];
    const { coords, timestamp } = location;

    const rawData = await AsyncStorage.getItem('@runData');
    const runData = rawData ? JSON.parse(rawData) : {
      route: [],
      distance: 0,
      calories: 0,
      lastCoord: null,
      lastTimestamp: null,
      runTime: 0,
    };

    const lastCoord = runData.lastCoord;
    const lastTimestamp = runData.lastTimestamp;
    const startTimestampRaw = await AsyncStorage.getItem('@runStartTime');
    const startTimestamp = startTimestampRaw ? parseInt(startTimestampRaw) : Date.now();
    const runTime = Math.floor((Date.now() - startTimestamp) / 1000);


    let distance = 0;
    if (lastCoord) {
      distance = calculateDistance(
        lastCoord.latitude,
        lastCoord.longitude,
        coords.latitude,
        coords.longitude
      );
    }

    const runSpeed = Number(coords.speed);

    let calories = runData.calories;
    if (distance > minDistance && runSpeed > 0 && runSpeed <= 13) {
      const timeToCaloriesCalc = (timestamp - (lastTimestamp ?? timestamp)) / 60000;
      const MET = 1 + 1.7145 * runSpeed;
      calories += ((MET * 3.5 * (75)) / 200) * timeToCaloriesCalc;
    }

    const updatedData = {
      route: [...runData.route, {
        latitude: coords.latitude,
        longitude: coords.longitude,
        speed: runSpeed,
        timestamp: formatDateToISO(timestamp),
        distance: distance,
      }],
      distance: runData.distance + distance,
      calories,
      lastCoord: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      runTime: runTime,
    };
    /*  if (shouldUpdateNotification()) {
      await showRunningNotification(updatedData.distance, runTime, calories);
    } */
    await AsyncStorage.setItem('@runData', JSON.stringify(updatedData));
  }
});
  

export const startLocationTracking = async () => {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  if (!hasStarted) {
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 1000, // ou distanceInterval: 5
      distanceInterval: 5,
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: false,
      foregroundService: {
        notificationTitle: 'Corrida em andamento',
        notificationBody: 'Estamos rastreando sua localização.',
      },
    });
  }
};


export const stopLocationTracking = async () => {
  try {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
    /* if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      notificationId = null;  
    } */

    await AsyncStorage.removeItem('@runData');
    console.log('🧹 Dados da corrida removidos do AsyncStorage.');

  } catch (error) {
    console.error('❌ Erro ao parar rastreamento ou limpar dados:', error);
  }
};
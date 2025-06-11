
import * as TaskManager from 'expo-task-manager';
import {
  startLocationUpdatesAsync,
  hasStartedLocationUpdatesAsync,
  Accuracy,
  stopLocationUpdatesAsync,
} from 'expo-location';
import { getStorageLocation, saveStorageLocation } from '@/libs/asyncStorage/locationStorage';
import { calculateDistance } from '@/utils/geoUtils';
import { formatDateToISO } from '@/utils';

export const BACKGROUND_LOCATION_TASK = 'location-tracking';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
  try {
    if (error) {
      throw error;
    }

    if(data){
      const { coords, timestamp } = data.locations[0];
      const speed = coords?.speed! > 0 ? Number(coords.speed) : 0
      const routesCoordinates = await getStorageLocation()
      const lastRouterCoordinates = routesCoordinates?.routes?.[routesCoordinates.routes.length - 1]

      const distance = lastRouterCoordinates ? calculateDistance(
        lastRouterCoordinates.latitude,
        lastRouterCoordinates.longitude,
        coords.latitude,
        coords.longitude
      ) : 0;
      const currentLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: formatDateToISO(timestamp),
        speed: speed,
        distance: distance
      }
      
      let timeToCaloriesCalc = (timestamp - (Number(lastRouterCoordinates?.timestamp) ?? 0)) / 60000;
      let MET = 1 + 1.7145 * Number(speed);
      const calories = ((MET * 3.5 * (75)) / 200) * timeToCaloriesCalc;

      const currentRouteCordinates = {
        route: currentLocation,
        distance,
        calories: routesCoordinates?.calories + calories, 
        startRunDate: routesCoordinates?.startRunDate === null ? new Date() : routesCoordinates?.startRunDate
      }

      await saveStorageLocation(currentRouteCordinates)
    }
  } catch (error) {
    console.log(error)
    stopLocationTask();
  }
 
});
  

export async function startLocationTask() {
  try {    
    const hasStarted = await hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
    if(hasStarted){
      await stopLocationTask()
    }
    await startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Accuracy.Highest,
      distanceInterval: 1,
      timeInterval: 1000
    });
  } catch (error) {
    console.log(error);
  }
}

export async function stopLocationTask() {
  try {
    const hasStarted = await hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)

    if(hasStarted){
      await stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
    }
  } catch (error) {
    console.log(error);
  }
}
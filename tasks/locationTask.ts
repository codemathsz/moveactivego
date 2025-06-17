
import * as TaskManager from 'expo-task-manager';
import {
  startLocationUpdatesAsync,
  hasStartedLocationUpdatesAsync,
  stopLocationUpdatesAsync,
} from 'expo-location';
import { getStorageLocation, saveStorageLocation } from '@/libs/asyncStorage/locationStorage';
import { calculateDistance } from '@/utils/geoUtils';
import { formatDateToISO } from '@/utils';
import { sendLogGrafana } from '@/apis/grafana.api';

export const BACKGROUND_LOCATION_TASK = 'location-tracking';
let accumulatedDistance = 0
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
      let routeToSend: any = []
      const distance = lastRouterCoordinates ? calculateDistance(
        lastRouterCoordinates.latitude,
        lastRouterCoordinates.longitude,
        coords.latitude,
        coords.longitude
      ) : 0;
      accumulatedDistance += distance;
      if (Number(accumulatedDistance.toFixed(2)) >= 0.02) {
        accumulatedDistance = 0
        routeToSend = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          speed: coords?.speed! > 0 ? Number(coords.speed) : 0,
          timestamp: formatDateToISO(timestamp),
          distance: distance,
        }
      }
      const currentLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: formatDateToISO(timestamp),
        speed: coords?.speed! > 0 ? Number(coords.speed) : 0,
        distance: distance
      }
      
      let timeToCaloriesCalc = (timestamp - (Number(lastRouterCoordinates?.timestamp) ?? 0)) / 60000;
      let MET = 1 + 1.7145 * Number(speed);
      const calories = ((MET * 3.5 * (75)) / 200) * timeToCaloriesCalc;

      const currentRouteCordinates = {
        route: currentLocation,
        routeToSend: routeToSend,
        distance,
        calories: (routesCoordinates?.calories ?? 0) + calories, 
        startRunDate: routesCoordinates?.startRunDate === null ? new Date() : routesCoordinates?.startRunDate
      }

      await saveStorageLocation(currentRouteCordinates)
    }
  } catch (error) {
    await sendLogGrafana('TASK_MANAGER: '+ JSON.stringify(error))
    console.log(error)
    stopLocationTask();
  }
 
});
  

export async function startLocationTask() {
  try {    
    /* throw new Error('Erro proposital para teste'); */
    const hasStarted = await hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
    if(hasStarted){
      await stopLocationTask()
    }
    await startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      distanceInterval: 1,
      timeInterval: 1000
    });
    sendLogGrafana('START_LOCATION_TASK')
  } catch (error) {
    await sendLogGrafana('START_LOCATION_TASK: '+  JSON.stringify(error))
    console.log(error);
  }
}

export async function stopLocationTask() {
  try {
    const hasStarted = await hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)

    if(hasStarted){
      await stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
    }
    await sendLogGrafana('STOP_LOCATION_TASK')
  } catch (error) {
    await sendLogGrafana('STOP_LOCATION_TASK: '+  JSON.stringify(error))
    console.log(error);
  }
}
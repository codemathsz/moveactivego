import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  RefObject,
  useCallback,
} from 'react';
import {finishRun, handleRequestOpenBox, postRun, updateRun} from '../apis/user.api';
import {
  requestForegroundPermissionsAsync,
  requestBackgroundPermissionsAsync,
  LocationSubscription,
  getCurrentPositionAsync,
  watchPositionAsync,
  Accuracy
} from 'expo-location';
import MapView from 'react-native-maps';
import { formatDateToISO, formatTime } from '../utils';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { calculateDistance } from '@/utils/geoUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startLocationTask, stopLocationTask } from '@/tasks/locationTask';
import { getStorageLocation, removeStorageLocation } from '@/libs/asyncStorage/locationStorage';
/* import * as Notifications from 'expo-notifications'; */

export interface RunContextType {
  location: ILocation | null;
  city: string;
  isRunning: boolean;
  startRun: () => Promise<void>;
  stopRun: () => Promise<void>;
  mapRef: RefObject<MapView>;
  routeCoordinates: RoutesType[];
  loading: boolean;
  formattedTimer: string;
  distance: number;
  calories: number;
  spawnedBoxItems: Items[]
  showItems: boolean
  handleCloseShowItems: () => void
  spawnedBox: Box | null
  timer: number
  firstRouteCoordinates:{
    latitude: number;
    longitude: number;
  } | null;
}

export type RoutesType ={
  latitude: number; 
  longitude: number, 
  speed: number, 
  distance: number, 
  timestamp: string
}
export interface IRun{
  id?: number;
  name: string;
  start_date: string;
  city: string;
  routes: RoutesType[]
  calories: number;
}

export type RunUpdateDTO = {
  calories: number,
  routes: RoutesType[]
  spawn_boxes?: {latitude: number,longitude: number}[]
};

export type RunFinishDTO = {
  end_date: string;
  calories: number;
  routes: RoutesType[]
};

export interface IResponseFinishRun {
  avg_speed: string
  calories: string
  city: string
  created_at: string
  distance: string
  duration: string
  end_date: string
  id: number
  max_speed: string
  min_speed: string
  name: string
  routes: RoutesType[]
  start_date: string
  updated_at: string
  user_id: number
}

export interface Box {
  box_id: number
  collected_at: any
  created_at: string
  id: number
  latitude: number
  longitude: number
  run_id: number
  updated_at: string
}

export interface Items {
  id: number
  name: string
  description: string
  price: string
  category: string
  picture: string
  rarity: string
  stock: number
  drop_rate: string
  durability: number
  speed: number
  speed_use: number
  efficiency: number
  agility: number
  comfort: number
  resistance: number
  wear_time: number
  created_at: string
  updated_at: string
  deleted_at: any
}

interface RunProviderProps {
  children: React.ReactNode;
}

interface ILocation{
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export const RunContext = createContext<RunContextType>({} as RunContextType);

export const RunProvider = ({children}: RunProviderProps) => {
    
  const { user, jwt } = useAuth();
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [location, setLocation] = useState<ILocation | null>(null);
  const [city, setCity] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [run, setRun] = useState<IRun | null>()
  const [routeCoordinates, setRouteCoordinates] = useState<RoutesType[]>([]);
  const [firstRouteCoordinates, setFirstRouteCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [calories, setCalories] = useState<number>(0);
  const [routesToSend, setRoutesToSend] = useState<RoutesType[]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [timer, setTimer] = useState(0);
  const [formattedTimer, setFormattedTimer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [spawnedBox, setSpawnedBox] = useState<Box | null>(null);
  const [hasSpawnedReward, setHasSpawnedReward] = useState(false);
  const [spawnedBoxItems, setSpawnedBoxItems] = useState<Items[]>([])
  const [hasOpeningBox, setHasOpeningBox] = useState(true);
  const [showItems, setShowItems] = useState<boolean>(false)
  const [stopingRun, setStopingRun] = useState<boolean>(false)
  const locationSubscription = useRef<LocationSubscription | null>(null);
  let lastRouteCoordinates: {latitude: number; longitude: number, timestamp: number} | null = null;
  let accumulatedDistance = 0;
  let runSpeed = 0;
  const minDistance = 0.001;
  const isRunningRef = useRef(isRunning);
  const appState = useRef(AppState.currentState);


  const fetchCity = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDGoW4cdlktD9eW-P49WpPedlDIHEt1HEY`
      );
      const data = await response.json();

      if (data.status === 'OK') {
        const cityComponent = data.results[0].address_components.find((component: any) =>
          component.types.includes('administrative_area_level_2')
        );
        return cityComponent?.long_name || 'Cidade não encontrada';
      }

      console.warn('Erro na geocodificação:', data.status);
      return 'Cidade não encontrada';
    } catch (error) {
      console.error('Erro ao buscar cidade:', error);
      return 'Cidade não encontrada';
    }
  };


  const initializeLocation = async () => {
    let {status} = await requestForegroundPermissionsAsync();
    if(status !== "granted"){
      console.log("Permissão negada.");
      return;
    }
    let userLocation = await getCurrentPositionAsync({})

    setLocation(userLocation as ILocation)
    startWatchingPosition()
  };

  const clearRun = async () => {
    setDistance(0);
    setCalories(0);
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    setFormattedTimer('');
    setTimer(0);
    setRouteCoordinates([]);
    setRun(null);
    setRoutesToSend([]);
    setSpawnedBox(null);
    setHasSpawnedReward(false);
    setHasOpeningBox(true);
    setShowItems(false);
    setSpawnedBoxItems([]);
    setCity('');
    setLocation(null);
    accumulatedDistance = 0;
    stopWatchingPosition();
    setIsRunning(false);
    await stopLocationTask()
    await removeStorageLocation()
  };
    
    
  const stopWatchingPosition = () => {
    if (locationSubscription) {
      locationSubscription.current?.remove();
      locationSubscription.current = null;
    }
  };

  const verifyBackgroundLocationPermission = async (): Promise<boolean> => {
    const backgroundPermissions = await requestBackgroundPermissionsAsync();
    if (!backgroundPermissions.granted) {
      Alert.alert(
        "Localização",
        'É necessário permitir que o App tenha acesso a localização em segundo plano. Acesse as configurações do dispositivo e habilite "Permitir o tempo todo".'
      );
      setLoading(false);
      return false;
    }
    return true;
  };

  const ensureCity = async (): Promise<string> => {
    if (city) return city;
    const lat = location?.coords?.latitude ?? 0;
    const lon = location?.coords?.longitude ?? 0;
    const currentCity = await fetchCity(lat, lon);
    setCity(currentCity);
    return currentCity;
  };

  const buildInitialRouteList = (): RoutesType[] => {
    if(!location) return []
    const { latitude = 0, longitude = 0 } = location.coords;
    const timestamp = formatDateToISO(location.timestamp || 0);

    return [
      {
        latitude,
        longitude,
        speed: 0,
        timestamp,
        distance: 0
      }
    ];
  };

  const buildRunDTO = (city: string, routes: RoutesType[]): IRun => ({
    name: "Corrida Rápida",
    start_date: formatDateToISO(new Date()),
    city,
    routes,
    calories: 0
  });

  const handleSuccessfulRunStart = async (runData: IRun, initialRoute: RoutesType) => {
    setIsRunning(true);
    await startLocationTask()
    isRunningRef.current = true;
    setRun(runData);
    setFirstRouteCoordinates({
      latitude: initialRoute.latitude,
      longitude: initialRoute.longitude,
    });
    setHasSpawnedReward(false);
    startWatchingPosition();
    console.log("Corrida iniciada com sucesso!");
    navigation.navigate('Run');
  };

  const startRun = async (): Promise<void> => {
    if (!jwt || !location) return;

    setLoading(true);

    try {
      const granted = await verifyBackgroundLocationPermission();
      if (!granted) return;

      const currentCity = await ensureCity();
      const initialRouteList = buildInitialRouteList();
      setRouteCoordinates(initialRouteList);

      const runDTO: IRun = buildRunDTO(currentCity, initialRouteList);
      const responseStartRun = await postRun(jwt, runDTO);

      if (responseStartRun.success || responseStartRun["success"]) {
        handleSuccessfulRunStart(responseStartRun.data.run, initialRouteList[0]);
      } else {
        console.warn("Erro ao iniciar corrida:", responseStartRun);
      }
    } catch (error) {
      console.error("Erro inesperado ao iniciar corrida:", error);
    } finally {
      setLoading(false);
    }
  };


  const stopRun = async ():Promise<void>  => {
    if(!jwt) return
    setStopingRun(true)
    setLoading(true)
    let routes = [...routesToSend];

    routes.push(routeCoordinates[routeCoordinates.length - 1] ?? routeCoordinates[0]);
    let finishRunDTO: RunFinishDTO = {
      end_date: formatDateToISO(new Date()),
      calories: calories!,
      routes: routes
    }
    const response = await finishRun(jwt, run?.id!,finishRunDTO)
    
    if(response.success){
      await AsyncStorage.removeItem('@runData');
      clearRun()
      
      startWatchingPosition()
      setIsRunning(false);
      setLoading(false)
      setFirstRouteCoordinates(null)
      /* await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.dismissAllNotificationsAsync(); */

      navigation.navigate('freeRun', { 
        distance: response?.data?.run?.distance ?? 0, 
        calories: response?.data?.run?.calories ?? 0,
        duration: response?.data?.run?.duration ?? 0,              
        max_speed: response?.data?.run?.max_speed ?? 0,
        min_speed: response?.data?.run?.min_speed ?? 0,
        avg_speed: response?.data?.run?.avg_speed ?? 0,
        allRoutes: response?.data?.run?.routes ?? [],
        firstRouteCoordinates: response?.data?.run?.routes[0] ?? [],
        lastRouteCoordinates: response?.data?.run?.routes[response?.routes?.length - 1] ?? []
      });
    }

    setLoading(false)
    setStopingRun(false)
  };

  const handleUpdateRun = async (jwt: string, runId: any,dto: RunUpdateDTO) =>{
    const response = await updateRun(jwt, runId, dto)
    
    if(response.success){
      setRun(response.data.run)
      return response.data.run
    }else{
      console.error("Erro ao atualizar rotas.");
      return null
    }
  }

  const startWatchingPosition = async () => {
    locationSubscription.current = await watchPositionAsync(
      {
        accuracy: Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 5,
      },
      async (location) => {
        const { coords, timestamp } = location;

        setLocation(location as ILocation);
        if (isRunningRef.current && !stopingRun) {
          mapRef.current!.animateCamera({
            center: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            },
            pitch: 60,
            heading: coords.heading || 0,
            zoom: 70,
          }, { duration: 1000 });
          let distance = lastRouteCoordinates
            ? calculateDistance(
                lastRouteCoordinates?.latitude,
                lastRouteCoordinates?.longitude,
                coords.latitude,
                coords.longitude
              )
            : 0;


          if(spawnedBox ){
            
            let distanceInMetersFromBox = calculateDistance(
              coords.latitude, 
              coords.longitude,
              spawnedBox?.latitude,
              spawnedBox?.longitude
            ) * 1000
            
            if(distanceInMetersFromBox <= 30 && jwt && hasOpeningBox){
              await openBox(jwt, spawnedBox.box_id)
            }
          }

          const speed = coords?.speed! > 0 ? Number(coords.speed) : 0
          accumulatedDistance += distance;

          setRouteCoordinates((prevRoutes) => [
            ...(prevRoutes || []),
            {
              latitude: coords.latitude,
              longitude: coords.longitude,
              speed: speed,
              timestamp: formatDateToISO(timestamp),
              distance: distance,
            },
          ]);

          if (Number(accumulatedDistance.toFixed(2)) >= 0.02) {
            accumulatedDistance = 0;
            setRoutesToSend((prevRoutes) => [
              ...(prevRoutes || []),
              {
                latitude: coords.latitude,
                longitude: coords.longitude,
                speed: coords?.speed! > 0 ? Number(coords.speed) : 0,
                timestamp: formatDateToISO(timestamp),
                distance: distance,
              },
            ]);
          }

          runSpeed = Number(coords.speed);
          if (
            routeCoordinates[routeCoordinates.length - 1]?.latitude !== 0 &&
            routeCoordinates[routeCoordinates.length - 1]?.longitude !== 0
          ) {
            setDistance((d) => (d += distance));
            let timeToCaloriesCalc =
              (timestamp - (lastRouteCoordinates?.timestamp ?? 0)) / 60000;

            lastRouteCoordinates = {
              latitude: coords.latitude,
              longitude: coords.longitude,
              timestamp: timestamp,
            };

            if (distance > minDistance && runSpeed > 0 && runSpeed <= 13) {
              let MET = 1 + 1.7145 * runSpeed;
              let calories =
                ((MET * 3.5 * (user?.weight ?? 75)) / 200) * timeToCaloriesCalc;

              setCalories((prevCalories) => prevCalories + calories);
            }
          }
        }
      }
    );
  };

  const openBox = async (jwt: string, boxId: number) =>{
    const response = await handleRequestOpenBox(jwt, boxId)
    if(response.status === "success"){
      setSpawnedBoxItems(response.data.items)
      setShowItems(true)
      setSpawnedBox(null)
    } 
    setHasOpeningBox(false)
  }

  const spawnReward = async () => {
    if(!jwt) return console.log("JWT is null.");
    if(routesToSend.length === 0){
      routesToSend.push({distance: 0, latitude:firstRouteCoordinates?.latitude!, longitude: firstRouteCoordinates?.longitude!, speed: 0, timestamp: new Date().toISOString().slice(0, 19).replace("T", " ")})
    }
    
    const userLat = routesToSend[routesToSend?.length -1].latitude
    const userLong = routesToSend[routesToSend?.length -1].longitude
    const responseGenerateRandomPoint = await generateRandomPoint(userLat, userLong, 150)
   
    console.log("Spawned box: ", responseGenerateRandomPoint.latitude, responseGenerateRandomPoint.longitude);
    
    

    let updateRouteDTO: RunUpdateDTO ={
      calories: calories,
      routes: routesToSend,
      spawn_boxes: [responseGenerateRandomPoint]
    }
    const responseUpdateRun = await handleUpdateRun(jwt, run?.id, updateRouteDTO);
    console.log(responseUpdateRun);
    
    if(responseUpdateRun){
      setSpawnedBox({
        ...responseUpdateRun.spawned_boxes[0], 
        latitude: parseFloat(responseUpdateRun.spawned_boxes[0].latitude),
        longitude: parseFloat(responseUpdateRun.spawned_boxes[0].longitude)
      });
     /*  await Notifications.scheduleNotificationAsync({
        content: {
          title: "Recompensa disponível!",
          body: "Uma nova caixa apareceu no mapa. Vá buscá-la!",
          sound: true,
        },
        trigger: null,
      }); */
    }
  };

  async function generateRandomPoint(latitude:number, longitude:number, radiusInMeters:number) {
    // Converte a distância em radianos
    const radius = radiusInMeters / 6371000; // Raio da Terra em metros
  
    // Gera um ângulo aleatório (em radianos)
    const angle = Math.random() * 2 * Math.PI;
  
    // Gera uma distância aleatória
    const randomRadius = radius * Math.sqrt(Math.random());
  
    // Cálculo da nova latitude e longitude
    const deltaLat = randomRadius * Math.sin(angle);
    const deltaLon = randomRadius * Math.cos(angle) / Math.cos(latitude * (Math.PI / 180));
  
    const newLat = latitude + (deltaLat * 180 / Math.PI);
    const newLon = longitude + (deltaLon * 180 / Math.PI);
  
    try {
      const response = await fetch(
        `https://roads.googleapis.com/v1/snapToRoads?path=${newLat},${newLon}&key=AIzaSyDGoW4cdlktD9eW-P49WpPedlDIHEt1HEY`
      );
  
      const data = await response.json();
  
      if (data.snappedPoints && data.snappedPoints.length > 0) {
        const snapped = data.snappedPoints[0].location;
        return {
          latitude: snapped.latitude,
          longitude: snapped.longitude,
        };
      } else {
        console.warn("No snapped point found. Returning original random point.");
        return { latitude: newLat, longitude: newLon };
      }
    } catch (error) {
      console.error("Error snapping to road:", error);
      return { latitude: newLat, longitude: newLon };
    }
  }

  const handleCloseShowItems = () => {
    setShowItems(false)
    setSpawnedBoxItems([])
  }


  useEffect(() => {
    if (!isRunning || hasSpawnedReward) return;
    const elapsedMinutes = timer / 60;
    
    if (elapsedMinutes < 2) return;
 
    if (elapsedMinutes >= 2 && elapsedMinutes < 20) {
      const spawnProbability  = Math.min((elapsedMinutes - 2) / 18, 1); //  0 a 1
      const roll = Math.random(); // de 0 a 1
      if (roll < spawnProbability  * 0.10) { // 10%
        spawnReward();
        setHasSpawnedReward(true);
      }
    }
  
    // spawna obrigatoriamente
    if (elapsedMinutes >= 20 && elapsedMinutes <= 30) {
      // Tempo aleatório entre 20 e 30 minutos
      const randomTarget = useRef(Math.floor(20 * 60 + Math.random() * 10 * 60));
  
      if (timer >= randomTarget.current) {
        spawnReward();
        setHasSpawnedReward(true);
      }
    }
  }, [timer, isRunning, hasSpawnedReward]);

  useEffect(() => {
    if(!jwt) return console.log("JWT is null.");
    if (isRunning && routesToSend && routesToSend.length >= 1) {

      let updateRouteDTO: RunUpdateDTO ={
        calories: calories,
        routes: routesToSend
      }
      handleUpdateRun(jwt, run?.id, updateRouteDTO);
    }
  }, [routesToSend]);  

  useEffect(() => {
    setFormattedTimer(formatTime(timer));
  }, [timer]);

  useEffect(() => {
    isRunningRef.current = isRunning;

    if(!stopingRun){
      if (isRunning) {
          intervalRef.current = setInterval(() => {
            setTimer(prevTimer => prevTimer + 1);
          }, 1000);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, stopingRun]);

  useEffect(() => {
    return () => {
      stopWatchingPosition();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const prevAppState = appState.current;
    appState.current = nextAppState;

    if (prevAppState.match(/inactive|background/) && nextAppState === 'active') {
      const isRunningData = await AsyncStorage.getItem('isRunningAsyncStorage');
      const { isRunning } = JSON.parse(isRunningData || '{}');
      
      const storageData = await getStorageLocation();
      
      // Popular estado com dados da corrida
      setRoutesToSend(storageData.routes || []);
      setDistance(storageData.distance || 0);
      setCalories(storageData.calories || 0);

      // Calcular tempo decorrido a partir da data de início
      if (storageData.startRunDate) {
        const startTime = new Date(storageData.startRunDate).getTime();
        const now = Date.now();
        const elapsedInSeconds = Math.floor((now - startTime) / 1000);
        setTimer(elapsedInSeconds);
      }

      if (isRunning) {
        setIsRunning(false);
        setTimeout(() => {
          setIsRunning(true);
        }, 100); // espera um pouco e ativa novamente
        isRunningRef.current = isRunning;
      } else {
        await AsyncStorage.removeItem('isRunningAsyncStorage');
        clearRun()
        setIsRunning(false);
        isRunningRef.current = isRunning;
      }
    }

    if (nextAppState === 'background') {
      await AsyncStorage.setItem(
        'isRunningAsyncStorage',
        JSON.stringify({ isRunning: isRunningRef.current })
      );

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  useEffect(() => {
    initializeLocation()
   
  
    const subscription = AppState.addEventListener('change', handleAppStateChange);
  
    return () => {
      subscription.remove();
    };
  }, []);
  
 /*  useFocusEffect(() =>{
    initializeLocation()
  })
 */
  return (
    <RunContext.Provider
      value={{
        location,
        city,
        isRunning,
        startRun,
        stopRun,
        loading,
        mapRef,
        routeCoordinates,
        formattedTimer,
        distance,
        calories,
        spawnedBoxItems,
        showItems,
        handleCloseShowItems,
        spawnedBox,
        timer,
        firstRouteCoordinates
      }}>
      {children}
    </RunContext.Provider>
  );
};

export const useRun = () => useContext(RunContext);

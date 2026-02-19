import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useRef,
  RefObject,
  useCallback,
} from 'react';
import {finishRun, handleRequestOpenBox, postRun, updateRun} from '../apis/user.api';
import {
  useForegroundPermissions,
  requestBackgroundPermissionsAsync,
  LocationSubscription,
  getCurrentPositionAsync,
  watchPositionAsync,
  Accuracy,
  LocationPermissionResponse
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

export interface RunActionsContextType {
  city: string;
  isRunning: boolean;
  startRun: () => Promise<void>;
  stopRun: () => Promise<void>;
  mapRef: RefObject<MapView | null>;
  loading: boolean;
  spawnedBoxItems: Items[]
  showItems: boolean
  handleCloseShowItems: () => void
  spawnedBox: Box | null
  locationForegroundPermissions: LocationPermissionResponse | null
  startWatchingPosition: () => void
  stopWatchingPosition: () => void
  locationSubscription: LocationSubscription | null
  isLoadingLocation: boolean
  initializeLocation: () => void
  finishedRunData: IResponseFinishRun | null
}

export interface RunMetricsContextType {
  formattedTimer: string;
  distance: number;
  calories: number;
  timer: number;
}

export interface RunGpsContextType {
  location: ILocation | null;
  routeCoordinates: RoutesType[];
  firstRouteCoordinates: {
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

const RunActionsContext = createContext<RunActionsContextType | null>(null);
const RunMetricsContext = createContext<RunMetricsContextType | null>(null);
const RunGpsContext = createContext<RunGpsContextType | null>(null);

export const RunProvider = ({children}: RunProviderProps) => {
    
  const { user, jwt } = useAuth();
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSubscriptionRef = useRef<LocationSubscription | null>(null);
  const lastRouteCoordinatesRef = useRef<{latitude: number; longitude: number; timestamp: number} | null>(null);
  const accumulatedDistanceRef = useRef(0);
  const runSpeedRef = useRef(0);
  const lastCameraUpdateRef = useRef(0);
  const lastCameraPositionRef = useRef<{ latitude: number; longitude: number; heading: number } | null>(null);
  const routeCoordinatesRef = useRef<RoutesType[]>([]);
  const routesToSendRef = useRef<RoutesType[]>([]);
  const firstRouteCoordinatesRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const distanceRef = useRef(0);
  const caloriesRef = useRef(0);
  const timerRef = useRef(0);
  const stopingRunRef = useRef(false);
  const spawnedBoxRef = useRef<Box | null>(null);
  const hasOpeningBoxRef = useRef(true);
  const runRef = useRef<IRun | null>(null);
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
  const minDistance = 0.001;
  const isRunningRef = useRef(isRunning);
  const appState = useRef(AppState.currentState);
  const [locationForegroundPermissions, requestLocationForegroundPermissions] = useForegroundPermissions()
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true)
  const [finishedRunData, setFinishedRunData] = useState<IResponseFinishRun | null>(null)
  const randomTargetRef = useRef<number | null>(null);

  useEffect(() => {
    stopingRunRef.current = stopingRun;
  }, [stopingRun]);

  useEffect(() => {
    spawnedBoxRef.current = spawnedBox;
  }, [spawnedBox]);

  useEffect(() => {
    hasOpeningBoxRef.current = hasOpeningBox;
  }, [hasOpeningBox]);

  useEffect(() => {
    runRef.current = run ?? null;
  }, [run]);

  useEffect(() => {
    firstRouteCoordinatesRef.current = firstRouteCoordinates;
  }, [firstRouteCoordinates]);

  const fetchCity = useCallback(async (latitude: number, longitude: number): Promise<string> => {
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
  }, []);

  const initializeLocation = useCallback(async () => {
    const userLocation = await getCurrentPositionAsync({})
    setLocation(userLocation as ILocation)
  }, []);

  const updateRouteCoordinates = useCallback(
    (updater: (prev: RoutesType[]) => RoutesType[]) => {
      setRouteCoordinates((prev) => {
        const next = updater(prev);
        routeCoordinatesRef.current = next;
        return next;
      });
    },
    []
  );

  const updateRoutesToSend = useCallback(
    (updater: (prev: RoutesType[]) => RoutesType[]) => {
      setRoutesToSend((prev) => {
        const next = updater(prev);
        routesToSendRef.current = next;
        return next;
      });
    },
    []
  );

  const updateDistance = useCallback((updater: (prev: number) => number) => {
    setDistance((prev) => {
      const next = updater(prev);
      distanceRef.current = next;
      return next;
    });
  }, []);

  const updateCalories = useCallback((updater: (prev: number) => number) => {
    setCalories((prev) => {
      const next = updater(prev);
      caloriesRef.current = next;
      return next;
    });
  }, []);

  const updateTimer = useCallback((updater: (prev: number) => number) => {
    setTimer((prev) => {
      const next = updater(prev);
      timerRef.current = next;
      return next;
    });
  }, []);

  const clearRun = async () => {
    updateDistance(() => 0);
    updateCalories(() => 0);
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    setFormattedTimer('');
    updateTimer(() => 0);
    updateRouteCoordinates(() => []);
    setRun(null);
    updateRoutesToSend(() => []);
    setSpawnedBox(null);
    setHasSpawnedReward(false);
    setHasOpeningBox(true);
    setShowItems(false);
    setSpawnedBoxItems([]);
    setCity('');
    setLocation(null);
    accumulatedDistanceRef.current = 0;
    lastRouteCoordinatesRef.current = null;
    runSpeedRef.current = 0;
    randomTargetRef.current = null;
    setIsRunning(false);
    await stopLocationTask()
    await removeStorageLocation()
  };
    

  const verifyBackgroundLocationPermission = useCallback(async (): Promise<boolean> => {
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
  }, []);

  const ensureCity = useCallback(async (): Promise<string> => {
    if (city) return city;
    const lat = location?.coords?.latitude ?? 0;
    const lon = location?.coords?.longitude ?? 0;
    const currentCity = await fetchCity(lat, lon);
    setCity(currentCity);
    return currentCity;
  }, [city, fetchCity, location]);

  const buildInitialRouteList = useCallback((): RoutesType[] => {
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
  }, [location]);

  const buildRunDTO = useCallback((city: string, routes: RoutesType[]): IRun => ({
    name: "Corrida Rápida",
    start_date: formatDateToISO(new Date()),
    city,
    routes,
    calories: 0
  }), []);

  const startWatchingPosition = useCallback(async () => {
    if (locationSubscriptionRef.current) {
      return;
    }

    setIsLoadingLocation(true);

    try {
      const subscription = await watchPositionAsync(
        {
          accuracy: Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1
        },
        async (location) => {
          const { coords, timestamp } = location;

          setLocation(location as ILocation);

          if (isRunningRef.current && !stopingRunRef.current) {
            const now = Date.now();
            const lastCamera = lastCameraPositionRef.current;
            const shouldUpdateCamera =
              now - lastCameraUpdateRef.current >= 900 ||
              !lastCamera ||
              Math.abs(lastCamera.latitude - coords.latitude) > 0.00005 ||
              Math.abs(lastCamera.longitude - coords.longitude) > 0.00005;

            if (shouldUpdateCamera && mapRef.current) {
              mapRef.current.animateCamera({
                center: {
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                },
                pitch: 60,
                heading: coords.heading || 0,
                zoom: 70,
              }, { duration: 1000 });

              lastCameraUpdateRef.current = now;
              lastCameraPositionRef.current = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                heading: coords.heading || 0,
              };
            }

            const lastRoute = lastRouteCoordinatesRef.current;
            const distance = lastRoute
              ? calculateDistance(
                  lastRoute.latitude,
                  lastRoute.longitude,
                  coords.latitude,
                  coords.longitude
                )
              : 0;

            if (spawnedBoxRef.current) {
              const distanceInMetersFromBox = calculateDistance(
                coords.latitude,
                coords.longitude,
                spawnedBoxRef.current.latitude,
                spawnedBoxRef.current.longitude
              ) * 1000;

              if (distanceInMetersFromBox <= 30 && jwt && hasOpeningBoxRef.current) {
                await openBox(jwt, spawnedBoxRef.current.box_id);
              }
            }

            const speed = coords?.speed && coords.speed > 0 ? Number(coords.speed) : 0;
            accumulatedDistanceRef.current += distance;

            updateRouteCoordinates((prevRoutes) => [
              ...(prevRoutes || []),
              {
                latitude: coords.latitude,
                longitude: coords.longitude,
                speed: speed,
                timestamp: formatDateToISO(timestamp),
                distance: distance,
              },
            ]);

            if (Number(accumulatedDistanceRef.current.toFixed(2)) >= 0.02) {
              accumulatedDistanceRef.current = 0;
              updateRoutesToSend((prevRoutes) => [
                ...(prevRoutes || []),
                {
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  speed: speed,
                  timestamp: formatDateToISO(timestamp),
                  distance: distance,
                },
              ]);
            }

            runSpeedRef.current = speed;
            const lastRecordedRoute = routeCoordinatesRef.current[routeCoordinatesRef.current.length - 1];

            if (lastRecordedRoute?.latitude !== 0 && lastRecordedRoute?.longitude !== 0) {
              const timeToCaloriesCalc =
                (timestamp - (lastRouteCoordinatesRef.current?.timestamp ?? 0)) / 60000;

              lastRouteCoordinatesRef.current = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                timestamp: timestamp,
              };

              if (distance > minDistance && runSpeedRef.current > 0 && runSpeedRef.current <= 13) {
                updateDistance((prev) => prev + distance);
                const MET = 1 + 1.7145 * runSpeedRef.current;
                const calories =
                  ((MET * 3.5 * (user?.weight ?? 75)) / 200) * timeToCaloriesCalc;

                updateCalories((prevCalories) => prevCalories + calories);
              }
            }
          }
        }
      );

      locationSubscriptionRef.current = subscription;
    } finally {
      setIsLoadingLocation(false);
    }
  }, [jwt, minDistance, updateCalories, updateDistance, updateRouteCoordinates, updateRoutesToSend, user?.weight]);

  const stopWatchingPosition = useCallback(() => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  }, []);

  const handleSuccessfulRunStart = useCallback(async (runData: IRun, initialRoute: RoutesType) => {
    console.log('🏃 handleSuccessfulRunStart - Dados recebidos:', JSON.stringify(runData, null, 2));
    console.log('🏃 ID da corrida:', runData?.id);
    
    // Verificar permissão de background antes de iniciar
    const hasBackgroundPermission = await verifyBackgroundLocationPermission();
    if (!hasBackgroundPermission) {
      console.error('❌ Permissão de background não concedida');
      Alert.alert(
        'Permissão Necessária',
        'Para registrar sua corrida, é necessário permitir o acesso à localização em segundo plano. Acesse as configurações e selecione "Permitir o tempo todo".'
      );
      return;
    }
    
    setIsRunning(true);
    console.log('✅ Iniciando location task...');
    await startLocationTask();
    isRunningRef.current = true;
    setRun(runData);
    runRef.current = runData;
    
    console.log('✅ Corrida salva no estado. runRef.current.id:', runRef.current?.id);
    
    setFirstRouteCoordinates({
      latitude: initialRoute.latitude,
      longitude: initialRoute.longitude,
    });
    firstRouteCoordinatesRef.current = {
      latitude: initialRoute.latitude,
      longitude: initialRoute.longitude,
    };
    setHasSpawnedReward(false);
    startWatchingPosition();
    console.log("✅ Corrida iniciada com sucesso!");
    
    navigation.navigate('Run');
  }, [navigation, startWatchingPosition, verifyBackgroundLocationPermission]);

  const startRun = useCallback(async (): Promise<void> => {
    if (!jwt || !location) return;

    setLoading(true);

    try {
      const currentCity = await ensureCity();
      const initialRouteList = buildInitialRouteList();
      updateRouteCoordinates(() => initialRouteList);
      updateRoutesToSend(() => initialRouteList);

      const runDTO: IRun = buildRunDTO(currentCity, initialRouteList);
      console.log('🚀 Iniciando corrida...');
      
      const responseStartRun = await postRun(jwt, runDTO);
      console.log('📥 Resposta completa do servidor:', JSON.stringify(responseStartRun, null, 2));

      if (responseStartRun.success || responseStartRun["success"]) {
        // Verificar estruturas possíveis da resposta
        let runData = responseStartRun.data?.run || (responseStartRun as any).run || responseStartRun.data;
        
        console.log('✅ Corrida criada com sucesso! Dados:', JSON.stringify(runData, null, 2));
        
        if (!runData?.id) {
          console.error('❌ CRÍTICO: ID da corrida não encontrado na resposta!');
          console.error('Estrutura da resposta:', JSON.stringify(responseStartRun, null, 2));
          Alert.alert(
            'Erro',
            'A corrida foi criada mas não foi possível obter o ID. Por favor, tente novamente.'
          );
          return;
        }
        
        await handleSuccessfulRunStart(runData, initialRouteList[0]);
      } else {
        console.warn("⚠️ Erro ao iniciar corrida:", responseStartRun);
        Alert.alert(
          'Erro ao Iniciar',
          responseStartRun.message || 'Não foi possível iniciar a corrida. Tente novamente.'
        );
      }
    } catch (error) {
      console.error("❌ Erro inesperado ao iniciar corrida:", error);
      Alert.alert(
        'Erro',
        'Erro inesperado ao iniciar corrida. Verifique sua conexão.'
      );
    } finally {
      setLoading(false);
    }
  }, [buildInitialRouteList, buildRunDTO, ensureCity, handleSuccessfulRunStart, jwt, location, updateRouteCoordinates, updateRoutesToSend]);

  const stopRun = useCallback(async (): Promise<void> => {
    if (!jwt) {
      console.error('JWT não disponível');
      return;
    }

    // Prevenir múltiplas chamadas simultâneas
    if (stopingRun) {
      console.log('Já está finalizando uma corrida');
      return;
    }

    try {
      setStopingRun(true);

      // 1. CAPTURAR DADOS ANTES DE QUALQUER LIMPEZA
      const currentRunId = runRef.current?.id;
      const currentCalories = caloriesRef.current;
      const currentRoutes = [...routesToSendRef.current].filter(r => r?.latitude && r?.longitude);

      console.log('🛑 Tentando finalizar corrida...');
      console.log('🔍 Estado atual do runRef:', JSON.stringify(runRef.current, null, 2));
      console.log('🔍 ID capturado:', currentRunId);
      console.log('🔍 Estado do run:', JSON.stringify(run, null, 2));

      if (!currentRunId) {
        console.error('❌ ERRO CRÍTICO: ID da corrida não encontrado!');
        console.error('runRef.current:', runRef.current);
        console.error('run:', run);
        throw new Error('ID da corrida não encontrado. A corrida pode não ter sido iniciada corretamente.');
      }

      console.log('✅ Finalizando corrida ID:', currentRunId);
      console.log('📊 Total de rotas:', currentRoutes.length);

      // 2. OBTER POSIÇÃO FINAL (se possível)
      let finalLocation = null;
      try {
        finalLocation = await getCurrentPositionAsync({
          accuracy: Accuracy.Highest,
        });
        console.log('Posição final capturada:', finalLocation);
      } catch (error) {
        console.warn('Não foi possível obter posição final:', error);
      }

      // 3. ADICIONAR COORDENADA FINAL (se necessário)
      if (finalLocation && currentRoutes.length > 0) {
        const lastRoute = currentRoutes[currentRoutes.length - 1];
        const finalCoord = {
          latitude: finalLocation.coords.latitude,
          longitude: finalLocation.coords.longitude,
          speed: finalLocation.coords.speed ? Math.max(0, finalLocation.coords.speed) : 0,
          timestamp: formatDateToISO(finalLocation.timestamp),
          distance: calculateDistance(
            finalLocation.coords.latitude,
            finalLocation.coords.longitude,
            lastRoute.latitude,
            lastRoute.longitude
          )
        };

        // Verificar se não é a mesma posição
        const distanceThreshold = 0.00005; // ~5 metros
        const isDifferentPosition = 
          Math.abs(finalCoord.latitude - lastRoute.latitude) > distanceThreshold ||
          Math.abs(finalCoord.longitude - lastRoute.longitude) > distanceThreshold;

        if (isDifferentPosition) {
          currentRoutes.push(finalCoord);
        }
      }

      // 4. GARANTIR PELO MENOS UMA COORDENADA
      if (currentRoutes.length === 0 && finalLocation) {
        currentRoutes.push({
          latitude: finalLocation.coords.latitude,
          longitude: finalLocation.coords.longitude,
          speed: finalLocation.coords.speed ? Math.max(0, finalLocation.coords.speed) : 0,
          timestamp: formatDateToISO(finalLocation.timestamp),
          distance: 0
        });
      }

      if (currentRoutes.length === 0 && firstRouteCoordinatesRef.current) {
        currentRoutes.push({
          latitude: firstRouteCoordinatesRef.current.latitude,
          longitude: firstRouteCoordinatesRef.current.longitude,
          speed: 0,
          timestamp: formatDateToISO(new Date()),
          distance: 0
        });
      }

      // 5. PREPARAR DTO
      const finishRunDTO: RunFinishDTO = {
        end_date: formatDateToISO(new Date()),
        calories: currentCalories || 0,
        routes: currentRoutes
      };

      console.log('Enviando dados para API:', finishRunDTO);

      // 6. CHAMAR API
      const response = await finishRun(jwt, currentRunId, finishRunDTO);
      console.log('Resposta da API:', response);

      // 7. VERIFICAR SUCESSO
      if (!response?.success) {
        throw new Error(response?.message || 'Falha ao finalizar corrida');
      }

      // 8. EXTRAIR DADOS DA CORRIDA
      const runData = response.data?.run || response.run;
      if (!runData) {
        console.warn('Dados da corrida não retornados pela API');
      }

      // 9. SALVAR DADOS FINALIZADOS PRIMEIRO
      console.log('Salvando dados da corrida finalizada...');
      if (runData) {
        setFinishedRunData(runData);
      }

      // 10. NAVEGAR PARA RESUMO IMEDIATAMENTE
      console.log('Navegando para tela de resumo...');
      navigation.navigate('RunSummary' as never);

      // 11. LIMPAR ESTADOS E STORAGE EM PARALELO (após navegação)
      console.log('Limpando estados em background...');
      
      // Executar limpezas em paralelo sem bloquear
      Promise.allSettled([
        AsyncStorage.removeItem('isRunningAsyncStorage'),
        stopLocationTask().catch(err => console.warn('Erro ao parar location task:', err)),
        removeStorageLocation().catch(err => console.warn('Erro ao remover storage:', err))
      ]).then(() => console.log('Limpeza completa'));

      // Limpar timer imediatamente
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Reset de variáveis globais
      accumulatedDistanceRef.current = 0;
      lastRouteCoordinatesRef.current = null;
      runSpeedRef.current = 0;
      randomTargetRef.current = null;

      // Reset de estados (executar em paralelo com as outras operações)
      updateDistance(() => 0);
      updateCalories(() => 0);
      setFormattedTimer('');
      updateTimer(() => 0);
      updateRouteCoordinates(() => []);
      setRun(null);
      updateRoutesToSend(() => []);
      setSpawnedBox(null);
      setHasSpawnedReward(false);
      setHasOpeningBox(true);
      setShowItems(false);
      setSpawnedBoxItems([]);
      setIsRunning(false);
      setFirstRouteCoordinates(null);
      setStopingRun(false);

      // Reiniciar observação de posição após um delay
      setTimeout(() => {
        startWatchingPosition();
      }, 500);

    } catch (error: any) {
      console.error('Erro ao finalizar corrida:', error);
      
      setStopingRun(false);
      
      Alert.alert(
        'Erro ao Finalizar',
        error?.message || 'Não foi possível finalizar a corrida. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  }, [jwt, navigation, startWatchingPosition, updateCalories, updateDistance, updateRouteCoordinates, updateRoutesToSend, updateTimer]);

  const handleUpdateRun = async (jwt: string, runId: any,dto: RunUpdateDTO) =>{
    const response = await updateRun(jwt, runId, dto)
    
    if(response.success){
      setRun(response.data.run)
      runRef.current = response.data.run
      return response.data.run
    }else{
      console.error("Erro ao atualizar rotas.");
      return null
    }
  }

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
    const routesSnapshot = routesToSendRef.current;
    const routesForSpawn = routesSnapshot.length === 0 && firstRouteCoordinates
      ? [{
          distance: 0,
          latitude: firstRouteCoordinates.latitude,
          longitude: firstRouteCoordinates.longitude,
          speed: 0,
          timestamp: new Date().toISOString().slice(0, 19).replace("T", " ")
        }]
      : routesSnapshot;
    
    const userLat = routesForSpawn[routesForSpawn.length -1].latitude
    const userLong = routesForSpawn[routesForSpawn.length -1].longitude
    const responseGenerateRandomPoint = await generateRandomPoint(userLat, userLong, 150)
   
    console.log("Spawned box: ", responseGenerateRandomPoint.latitude, responseGenerateRandomPoint.longitude);
    
    

    let updateRouteDTO: RunUpdateDTO ={
      calories: caloriesRef.current,
      routes: routesForSpawn,
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

  const handleCloseShowItems = useCallback(() => {
    setShowItems(false)
    setSpawnedBoxItems([])
  }, [])


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
      if (!randomTargetRef.current) {
        randomTargetRef.current = Math.floor(20 * 60 + Math.random() * 10 * 60);
      }

      if (timer >= (randomTargetRef.current || 0)) {
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
            updateTimer(prevTimer => prevTimer + 1);
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

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const prevAppState = appState.current;
    appState.current = nextAppState;

    if (prevAppState.match(/inactive|background/) && nextAppState === 'active') {
      const isRunningData = await AsyncStorage.getItem('isRunningAsyncStorage');
      const { isRunning } = JSON.parse(isRunningData || '{}');
      console.log("IS RUNNING: ", isRunning);
      
      const storageData = await getStorageLocation();

      
      updateRouteCoordinates(prev => [...prev, ...(storageData.routes || [])]);

      updateRoutesToSend(prev => [
        ...prev,
        ...(storageData.routeToSend?.filter(r => r.latitude && r.longitude) || [])
      ]);

      updateDistance((prev) => prev + (storageData.distance || 0));

      updateCalories(() => storageData.calories || 0);
      
      if (storageData.startRunDate) {
        const startTime = new Date(storageData.startRunDate).getTime();
        const now = Date.now();
        const elapsedInSeconds = Math.floor((now - startTime) / 1000);
        updateTimer(() => elapsedInSeconds);
      }

      if (isRunning) {
        setIsRunning(false);
        setTimeout(() => {
          setIsRunning(true);
        }, 500); // espera um pouco e ativa novamente
        isRunningRef.current = isRunning;
      } else {
        await AsyncStorage.removeItem('isRunningAsyncStorage');
        setIsRunning(false);
        isRunningRef.current = false;
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
    const initPermissions = async () => {
      await requestLocationForegroundPermissions();
      await verifyBackgroundLocationPermission();
    };
    
    initPermissions();
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
  
    return () => {
      subscription.remove();
    };
  }, []);

  const actionsValue = useMemo<RunActionsContextType>(() => ({
    city,
    isRunning,
    startRun,
    stopRun,
    mapRef,
    loading,
    spawnedBoxItems,
    showItems,
    handleCloseShowItems,
    spawnedBox,
    locationForegroundPermissions,
    startWatchingPosition,
    stopWatchingPosition,
    locationSubscription: locationSubscriptionRef.current,
    isLoadingLocation,
    initializeLocation,
    finishedRunData,
  }), [
    city,
    isRunning,
    startRun,
    stopRun,
    loading,
    spawnedBoxItems,
    showItems,
    handleCloseShowItems,
    spawnedBox,
    locationForegroundPermissions,
    startWatchingPosition,
    stopWatchingPosition,
    isLoadingLocation,
    initializeLocation,
    finishedRunData,
  ]);

  const metricsValue = useMemo<RunMetricsContextType>(() => ({
    formattedTimer,
    distance,
    calories,
    timer,
  }), [formattedTimer, distance, calories, timer]);

  const gpsValue = useMemo<RunGpsContextType>(() => ({
    location,
    routeCoordinates,
    firstRouteCoordinates,
  }), [location, routeCoordinates, firstRouteCoordinates]);
  
  return (
    <RunActionsContext.Provider value={actionsValue}>
      <RunMetricsContext.Provider value={metricsValue}>
        <RunGpsContext.Provider value={gpsValue}>
          {children}
        </RunGpsContext.Provider>
      </RunMetricsContext.Provider>
    </RunActionsContext.Provider>
  );
};

export const useRun = () => {
  const context = useContext(RunActionsContext);
  if (!context) {
    throw new Error('useRun deve ser usado dentro de um RunProvider');
  }
  return context;
};

export const useRunMetrics = () => {
  const context = useContext(RunMetricsContext);
  if (!context) {
    throw new Error('useRunMetrics deve ser usado dentro de um RunProvider');
  }
  return context;
};

export const useRunGps = () => {
  const context = useContext(RunGpsContext);
  if (!context) {
    throw new Error('useRunGps deve ser usado dentro de um RunProvider');
  }
  return context;
};

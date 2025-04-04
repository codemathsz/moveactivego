import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  RefObject,
} from 'react';
import {finishRun, postRun, updateRun} from '../apis/user.api';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import { formatDateToISO, formatTime } from '../utils';
import { useAuth } from './AuthContext';

export interface RunContextType {
  isRunning: boolean;
  stopRun: (jwt: string, dto: RunFinishDTO) => Promise<IResponseFinishRun | null>;
  startRun: (jwt: string, run: IRun ) => void;
  formattedTimer: string;
  distance: number;
  startWatchingPosition: (weight: number) => void;
  handleSetRouteCoordinates: (latitude: number, longitude: number,speed: number, timestamp: string, distance: number) => void;
  routeCoordinates: RoutesType[];
  handleSetFirstRouteCoordinates: (latitude: number, longitude: number) => void;
  firstRouteCoordinates: {latitude: number; longitude: number} | undefined;
  calories: number | null;
  mapRef: RefObject<MapView>;
  routesToSend: RoutesType[];
  lastRouteCoordinates: {latitude: number; longitude: number, timestamp: number} | null
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

interface RunProviderProps {
  children: React.ReactNode;
}

export const RunContext = createContext<RunContextType>({} as RunContextType);

export const RunProvider = ({children}: RunProviderProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<MapView>(null);
  const { jwt } = useAuth();
  const [run, setRun] = useState<IRun | null>()
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [formattedTimer, setFormattedTimer] = useState<string>('');
  const [distance, setDistance] = useState<number>(0);
  const [routeCoordinates, setRouteCoordinates] = useState<RoutesType[]>([]);
  const [routesToSend, setRoutesToSend] = useState<RoutesType[]>([]);
  const [firstRouteCoordinates, setFirstRouteCoordinates] = useState<{
    latitude: number;
    longitude: number;
  }>();
  const [calories, setCalories] = useState<number>(0);
  let runSpeed = 0;
  const minDistance = 0.001;
  let accumulatedDistance = 0;
  let lastRouteCoordinates: {latitude: number; longitude: number, timestamp: number} | null = null;

  const handleSetRouteCoordinates = (latitude: number, longitude: number,speed: number, timestamp: string, distance: number) => {
    setRouteCoordinates([{latitude, longitude, speed, timestamp, distance}]);
  };

  const handleSetFirstRouteCoordinates = (
    latitude: number,
    longitude: number,
  ) => {
    setFirstRouteCoordinates({latitude, longitude});
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const earthRadius = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;

    return Number(distance);
  };

  const toRadians = (degrees: number): number => {
    return (degrees * Math.PI) / 180;
  };

  

  const clearRun = () =>{
    setDistance(0)
    setCalories(0)
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    setFormattedTimer('');
    setTimer(0)
    setRouteCoordinates([])
    setRun(null)
    setRoutesToSend([])
    accumulatedDistance = 0
  }

  const startRun = async (jwt: string, run: IRun) => {
    /* if(!jwt) return
    let responseStartRun = await postRun(jwt, run);
    console.log("response", responseStartRun);
    console.log("response success", responseStartRun["success"]);
    if(responseStartRun.success || responseStartRun["success"]){ */
      setIsRunning(true);
      /* setRun(responseStartRun?.data?.run);
    } */
  };

  const stopRun = async (jwt: string, dto: RunFinishDTO): Promise<IResponseFinishRun | null> => {
   /*  const response = await finishRun(jwt, run?.id!,dto,)

    if(response.success){
      const updatedRun = {
        ...response.data.run,
        routes: routeCoordinates,
      }; */
      clearRun()
      setIsRunning(false);
      return null
     /*  return updatedRun
    }else{
      console.error("Erro ao finalizar corrida.");
      return null
    } */
  };

  const startWatchingPosition = async (weight: number) => {
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000, // Intervalo de tempo em milissegundos
        distanceInterval: 1, // Distância mínima em metros
      },
      (location) => {
        const { coords, timestamp } = location;
        if (isRunning) {
          console.log('IS RUNNING');

          let distance = lastRouteCoordinates
            ? calculateDistance(
                lastRouteCoordinates?.latitude,
                lastRouteCoordinates?.longitude,
                coords.latitude,
                coords.longitude
              )
            : 0;

          accumulatedDistance += distance;
          console.log('accumulatedDistance', accumulatedDistance);

          setRouteCoordinates((prevRoutes) => [
            ...(prevRoutes || []),
            {
              latitude: coords.latitude,
              longitude: coords.longitude,
              speed: Number(coords.speed),
              timestamp: formatDateToISO(timestamp),
              distance: distance,
            },
          ]);

          if (Number(accumulatedDistance.toFixed(2)) === 0.02) {
            accumulatedDistance = 0;
            setRoutesToSend((prevRoutes) => [
              ...(prevRoutes || []),
              {
                latitude: coords.latitude,
                longitude: coords.longitude,
                speed: Number(coords.speed),
                timestamp: formatDateToISO(timestamp),
                distance: distance,
              },
            ]);
          }

          mapRef.current?.animateCamera({
            pitch: 70,
            center: coords,
          });

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
                ((MET * 3.5 * weight) / 200) * timeToCaloriesCalc;

              setCalories((prevCalories) => prevCalories + calories);
            }
          }
        }else{
          if(isRunning === false){
            setFirstRouteCoordinates({
              latitude: coords.latitude,
              longitude: coords.longitude
            })
          }
        }
      }
    );
  };

  const handleUpdateRun = async (jwt: string, runId: any,dto: RunUpdateDTO) =>{
    const response = await updateRun(jwt, runId, dto)
    console.log("UPDATE RUN: ", response);
    
    if(response.success){
      console.log("response.data.run: ",response.data.run);
      
      setRun(response.data.run)
    }else{
      console.error("Erro ao atualizar rotas.");
    }
  }

  useEffect(() => {
    if(!jwt) return console.log("JWT is null.");
    if (isRunning && routesToSend && routesToSend.length >= 1) {
      console.log("chamou update");
      
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

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return (
    <RunContext.Provider
      value={{
        isRunning,
        startRun,
        stopRun,
        formattedTimer,
        distance,
        startWatchingPosition,
        handleSetRouteCoordinates,
        routeCoordinates,
        handleSetFirstRouteCoordinates,
        firstRouteCoordinates,
        calories,
        mapRef,
        routesToSend,
        lastRouteCoordinates,
      }}>
      {children}
    </RunContext.Provider>
  );
};

export const useRun = () => useContext(RunContext);

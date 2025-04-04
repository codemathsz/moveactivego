import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Polyline, Region, Marker} from 'react-native-maps';
import * as Location from "expo-location"
import { colors } from "@/constants/Screen";
import Ionicons from '@expo/vector-icons/Ionicons';
import { IRun, RunFinishDTO, useRun } from '../contexts/RunContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateToISO } from '@/utils';
import { useRouter } from 'expo-router';
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
const MapArea = (props: { start?: boolean, dashboard: boolean, card?: boolean, initialLocation?: any, skill?: any[] }) => {
  const { 
    mapRef,
    isRunning,
    startRun,
    stopRun,
    startWatchingPosition, 
    handleSetRouteCoordinates,
    handleSetFirstRouteCoordinates,
    firstRouteCoordinates, 
    routeCoordinates,
    calories,
    routesToSend
  } = useRun()
  const route = useRouter()
  const { user, jwt } = useAuth();
  const [location, setLocation] = useState<ILocation | null>(null)
  const [city, setCity] = useState<string>('');

  async function requestAuthorization () {
    let {status} = await Location.requestForegroundPermissionsAsync();
    if(status !== "granted"){
      console.log("Permissão negada.");
      return;
    }
    let userLocation = await Location.getCurrentPositionAsync({})
    setLocation(userLocation as ILocation)
    if(location){
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=AIzaSyDGoW4cdlktD9eW-P49WpPedlDIHEt1HEY`)
      .then((response) =>  response.json())
      .then((data) => {
        if (data.status === 'OK') {
          const city = data.results[0].address_components.find((component: { types: string | string[]; }) => {
            return component.types.includes('administrative_area_level_2');
          });
          if (city) {
            setCity(city.long_name);
          } else {
            setCity('Cidade não encontrada');
          }
        } else {
          setCity('Erro ao obter a cidade');
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar detalhes da localização: ', error);
        setCity('Erro ao obter a cidade');
      });
    }
  }

  const toggleRun = async () => {
    if(!jwt) return console.error('JWT is null');
    if(isRunning){
      if(props.dashboard){
        return route.push('/run');
      }
      
      let routes = [...routesToSend];

      routes.push(routeCoordinates[routeCoordinates.length - 1]);
      let finishRunDTO: RunFinishDTO = {
        end_date: formatDateToISO(new Date()),
        calories: calories!,
        routes: routes
      }
      /* const response = await stopRun(jwt,finishRunDTO ) */
      const response = {
        distance: 5.2, // em quilômetros
        calories: 300, // em kcal
        duration: 1800, // em segundos (30 minutos)
        max_speed: 12.5, // em km/h
        min_speed: 4.8, // em km/h
        avg_speed: 8.4, // em km/h
        routes: [
          { latitude: -23.598276, longitude: -46.711479 },
          { latitude: -23.597481, longitude: -46.712340 },
          { latitude: -23.596320, longitude: -46.713210 },
        ],
      };
      return route.push({pathname:'/freeRun', params: {
        distance: response?.distance, 
        calories: response?.calories,
        duration: response?.duration,
        max_speed: response?.max_speed,
        min_speed: response?.min_speed,
        avg_speed: response?.avg_speed,
        allRoutes: JSON.stringify(response?.routes) 
      }});
    }else{
      // if peso ? segue : modal pra atualizar
      let dto: IRun ={
        name: "Corrida Rápida",
        start_date: formatDateToISO(new Date()),
        city: city,
        routes: routeCoordinates,
        calories: 0,
      }
      await startRun(jwt,dto)
      startWatchingPosition(user?.weight || 0)
      
      if(location){
        handleSetFirstRouteCoordinates(
          location?.coords?.latitude, 
          location?.coords.longitude, 
        )
      }
      return route.push('/run');
    }
  };

  useEffect(() =>{
    if(location){
      handleSetRouteCoordinates(
        location?.coords?.latitude, 
        location?.coords.longitude, 
        location?.coords?.speed ?? 0, 
        formatDateToISO(location?.timestamp),
        0
      )
    }
  },[location])

  useFocusEffect(
    useCallback(() => {
      requestAuthorization()
      startWatchingPosition(80)
    }, [])
  );

  useEffect(() =>{
    console.log("routeCoordinates ", routeCoordinates?.length);
    
  },[routeCoordinates])

  return (
    <View style={styles.mapContainer}>
      {location ? (
        <MapView
          style={styles.map}
          ref={mapRef}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {
            isRunning && firstRouteCoordinates && (
              <Marker 
                coordinate={{
                  latitude: firstRouteCoordinates.latitude,
                  longitude: firstRouteCoordinates.longitude
                }}
              />
            )
          }
          {isRunning && routeCoordinates && (
            <Polyline
              coordinates={routeCoordinates?.map(route => ({
                latitude: route.latitude,
                longitude: route.longitude,
              }))}
              strokeColor="#FF0000" 
              strokeWidth={3}
            />
          )}
        </MapView>

      ) : null}

      {!props.dashboard && (
        <TouchableOpacity style={styles.buttonPause} onPress={toggleRun}>
          <Ionicons name="pause" size={24} color="white" />
        </TouchableOpacity>
      )}

      {!props.card && (
        <View style={styles.customButton}>
          <TouchableOpacity
            onPress={toggleRun}
            style={false ? styles.buttonStop : styles.button}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.text}>{false ? 'Corrida iniciada' : 'Iniciar Corrida'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customButton: {
    bottom: 80,
    marginHorizontal: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    lineHeight: 24,
    letterSpacing: 1.4,
  },
  buttonStop: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    borderWidth: 1,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  text: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    lineHeight: 24,
    letterSpacing: 1.4,
    color: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  buttonPause: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    bottom: 450,
    left: 300,
    zIndex: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    color: '#555555'
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    color: '#555555'
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: 300
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: '#555555',
    borderWidth: 1,
    marginBottom: 8,
    height: 45,
  },
  cadastrarButton: {
    marginBottom: 8,
    height: 45,
  },
  cancelButtonText: {
    color: '#555555',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MapArea;

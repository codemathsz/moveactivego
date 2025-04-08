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
import CustomButton from './customButton';
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
  const navigation = useNavigation<any>();
  const { user, jwt } = useAuth();
  const [location, setLocation] = useState<ILocation | null>(null)
  const [city, setCity] = useState<string>('');
  const [loading, setLoading] = useState(false)

  async function requestAuthorization () {
    let {status} = await Location.requestForegroundPermissionsAsync();
    if(status !== "granted"){
      console.log("Permissão negada.");
      return;
    }
    let userLocation = await Location.getCurrentPositionAsync({})

    
    setLocation(userLocation as ILocation)
    console.log(userLocation);
      
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${userLocation.coords.latitude},${userLocation.coords.longitude}&key=AIzaSyDGoW4cdlktD9eW-P49WpPedlDIHEt1HEY`)
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

  const toggleRun = async () => {
    if(!jwt) return console.error('JWT is null');
    setLoading(true)
    if(isRunning){
      if(props.dashboard){
        return navigation.navigate('Run' as never);
      }
      
      let routes = [...routesToSend];

      routes.push(routeCoordinates[routeCoordinates.length - 1]);
      let finishRunDTO: RunFinishDTO = {
        end_date: formatDateToISO(new Date()),
        calories: calories!,
        routes: routes
      }
      const response = await stopRun(jwt,finishRunDTO )
      setLoading(false)
      navigation.navigate('freeRun', { 
        distance: response?.distance ?? 0, 
        calories: response?.calories ?? 0,
        duration: response?.duration ?? 0,
        max_speed: response?.max_speed ?? 0,
        min_speed: response?.min_speed ?? 0,
        avg_speed: response?.avg_speed ?? 0,
        allRoutes: response?.routes ?? []
      });
    }else{
      // if peso ? segue : modal pra atualizar
      requestAuthorization()
      let dto: IRun ={
        name: "Corrida Rápida",
        start_date: formatDateToISO(new Date()),
        city,
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
      setLoading(false)
      return navigation.navigate('Run');
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
    console.log("aqq");
    
    requestAuthorization()
  },[])

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
        <CustomButton 
          onPress={() => toggleRun()} 
          style={styles.buttonPause} 
          loading={loading} 
          icon={
            <Ionicons name="pause" size={24} color="white" />
          }
        />

      )}

      {!props.card && (
        <View style={styles.customButton}>
          
          <CustomButton title={isRunning ? 'Corrida iniciada' : 'Iniciar Corrida'} onPress={() => toggleRun()} style={isRunning ? styles.buttonStop : styles.button} loading={loading} />
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

import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import NavigationBar from '../../components/navigationBar';
import FreeRunInfo, { RunStat } from '../../components/FreeRunInfo';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { RoutesType, useRun } from '../../contexts/RunContext';
import { colors } from '../../constants/Screen';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import polyline from '@mapbox/polyline';

interface RouteParamsStart {
  avg_speed: string
  calories: string
  distance: string
  duration: string
  max_speed: string
  min_speed: string
  allRoutes: RoutesType[]
}

const FreeRun = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [routeToRender, setRouteToRender] = useState<RoutesType[]>([]);
  const viewRef = useRef(null);
  const mapRef = useRef<MapView>(null);
  const [image, setImage] = useState('');
  const { max_speed }: RouteParamsStart = route.params as any|| {}
  const { min_speed }: RouteParamsStart = route.params as any || {};
  const { avg_speed }: RouteParamsStart = route.params as any || {};
  const { duration }: RouteParamsStart = route.params as any || {};
  const { distance }: RouteParamsStart = route.params as any || {};
  const { calories }: RouteParamsStart = route.params as any || {};
  const { firstRouteCoordinates } = route.params as any || {};
  const { lastRouteCoordinates }= route.params as any || {};
  const { allRoutes }: RouteParamsStart = route.params as any || [{}];
  const [showInfoPrint, setShowInfoPrint] = useState(false);
  const { appVersion } = useAuth();



  const routeCoordinates = allRoutes?.map(coord => ({
    latitude: coord.latitude,
    longitude: coord.longitude,
    speed: coord.speed,
    distance: coord.distance,
    timestamp: coord.timestamp
  }));

  const onShare = async () => {
    try {
      setImage('teste');
      setShowInfoPrint(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      if (uri) {
          const base64Image = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const dataUri = `data:image/png;base64,${base64Image}`;

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
          } else {
            alert("Compartilhamento não suportado neste dispositivo.");
          }
      } else {
        console.error('CaptureRef retornou um URI vazio');
      }
    } catch (error) {
      console.error('Erro ao compartilhar a captura de tela: ', error);
    } finally {
      setImage('');
      setShowInfoPrint(false);
    }
  };

  function sampleWaypoints(points: RoutesType[], maxWaypoints = 23): RoutesType[] {
    if (points.length <= maxWaypoints) {
      return points;
    }

    const step = Math.floor(points.length / maxWaypoints);
    const sampled = [];

    for (let i = 0; i < points.length; i += step) {
      sampled.push(points[i]);
    }

    return sampled;
  }

  async function getRoutesWithAPIGoogle(origin: RoutesType, destination: RoutesType, waypoints:RoutesType[] = [],fallbackRoute: RoutesType[]) {
    try {

      const waypointsStr = waypoints.length
      ? `&waypoints=${waypoints.map(p => `${p.latitude},${p.longitude}`).join('|')}`
      : '';
  
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}${waypointsStr}&key=AIzaSyDGoW4cdlktD9eW-P49WpPedlDIHEt1HEY`
      );
  
      const data = await response.json();
      console.log("DATA RUN FREE: ",data);
      if(data.status === 'OK'){
        const points = polyline.decode(data.routes[0].overview_polyline.points);
  
        const routeCoords = points.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
          speed: 0, 
          distance: 0, 
          timestamp: new Date().toISOString(),
        }));
  
        setRouteToRender(routeCoords);
      }else{
        console.warn("Error fetching route", data);
        setRouteToRender(fallbackRoute);
      }
    } catch (error) {
      console.error('Error fetching Google route', error);
      setRouteToRender(fallbackRoute);
    }
  }

  


  const renderMarkers = () => {
    return (
      <>
        <Marker
          coordinate={{
            latitude: allRoutes[0].latitude,
            longitude: allRoutes[0].longitude,
          }}
          title="Início"
          description="Início da rota"
          pinColor="red"
        />

        <Marker
          coordinate={{
            latitude: allRoutes[allRoutes.length - 1].latitude,
            longitude: allRoutes[allRoutes.length - 1].longitude,
          }}
          title="Fim"
          description="Fim da rota"
          pinColor="blue"
        />
      </>
    );
  };

  function formatToMinutes(duration: string) {
    const [hours, minutes, seconds] = duration.split(":");

    if (hours === "00") {
      return `${minutes}:${seconds}`;
    }
    return duration;
  }

  useEffect(() =>{
    if(routeCoordinates?.length > 1){
      const allWaypoints = routeCoordinates.slice(1, -1);
      const sampledWaypoints = sampleWaypoints(allWaypoints, 20);

      getRoutesWithAPIGoogle(
        routeCoordinates[0], 
        routeCoordinates[routeCoordinates.length -1], 
        sampledWaypoints,
        routeCoordinates
      )
    }
  },[allRoutes])

  useEffect(() =>{
    if (!routeCoordinates || routeCoordinates.length < 2) return;

    const start = routeCoordinates[0];
    const end = routeCoordinates[routeCoordinates.length - 1];

    const center = {
      latitude: (start.latitude + end.latitude) / 2,
      longitude: (start.longitude + end.longitude) / 2,
    };

    mapRef.current?.animateCamera({
      zoom: 16,
      center,
    });
  },[routeCoordinates])

  return (
    <SafeAreaView style={styles.container}>
      <ViewShot ref={viewRef} options={{ format: 'jpg', quality: 1 }} style={{ flex: 1,backgroundColor: colors.background, }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('/dashboard')}
          style={styles.backButton}
        >
          {/* <Icon name="keyboard-arrow-left" size={24} color="#888888" /> */}
        </TouchableOpacity>

        <View style={[styles.mapContainer, { paddingTop: 5 }]}>
          <Text style={styles.versionText}>{appVersion}</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: allRoutes[0]?.latitude,
              longitude: allRoutes[0]?.longitude,
              latitudeDelta: 0.005,
            longitudeDelta: 0.005
            }}
            mapPadding={{ top: 200, right: 0, bottom: 0, left: 0 }}
            ref={mapRef}
          >
            <Polyline
              coordinates={routeToRender}
              strokeColor="#FF0000" 
              strokeWidth={3}
            />
            {renderMarkers()}
          </MapView>
          {!image? 
            <View  style={styles.infoContainer}>
            <FreeRunInfo
              maxSpeed={max_speed}
              minSpeed={min_speed}
              avgSpeed={avg_speed}
              timeTotal={formatToMinutes(duration)}
              calorias={Number(calories).toFixed(2)}
              totalDistance={distance}
              onShare={onShare}
            />
          </View>
          :null}
        
        </View>
        {
          showInfoPrint ? (
          <View style={{flexDirection: 'row', bottom: 110, gap: 12, justifyContent: 'center'}}>
            <RunStat image={require('../../assets/icons/minSpeed.png')} value={min_speed || 0 + ' KM'} label="Velocidade mínima" color='#555555' />
            <RunStat image={require('../../assets/icons/averageSpeed.png')} value={avg_speed || 0 + ' KM'} label="Velocidade média" color='#3FDC81' />
            <RunStat image={require('../../assets/icons/maxSpeed.png')} value={max_speed || 0 + ' KM'} label="Velocidade máxima" color='#555555' />
            <RunStat image={require('../../assets/icons/total-time-icon.png')} value={formatToMinutes(duration) || '00:00'} label="Duração" color='#FC457B' />
            <RunStat image={require('../../assets/icons/total-distance-icon.png')} value={distance || '0'} label="Corridos" color='#FFB905' />
            <RunStat image={require('../../assets/icons/caloriesBlue.png')} value={Number(calories).toFixed(2) || '0'} label="Calorias" color='#006FDD' />
          </View>

          ): null
        }
        <View style={styles.navigationBar}>
          <NavigationBar />
        </View>
      </ViewShot>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 16,
    marginVertical: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    height: '80%',
    width: '100%',
    borderRadius: 20,
    borderColor: colors.border,
    position: 'relative'
  },
  infoContainer: {
    top: 200,
    
  },
  navigationBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  lightBackground: {
    flex: 1,
    backgroundColor: '#eff9ff',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  averageSpeed: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  versionText: {
    position: 'absolute',
    top: 1,
    right: 1,
    fontSize: 10,
    color: 'gray',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 4,
    zIndex: 10
  },
});

export default FreeRun;
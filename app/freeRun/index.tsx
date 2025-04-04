import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import NavigationBar from '../../components/navigationBar';
import FreeRunInfo from '../../components/FreeRunInfo';
/* import Icon from 'react-native-vector-icons/MaterialIcons'; */
/* import ViewShot, { captureRef } from 'react-native-view-shot'; */
/* import Share from 'react-native-share';
import RNFS from 'react-native-fs'; */
import { RoutesType, useRun } from '../../contexts/RunContext';
import { colors } from '../../constants/Screen';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface RouteParamsStart {
  avg_speed: string
  calories: string
  distance: string
  duration: string
  max_speed: string
  min_speed: string
  allRoutes: string
}

const FreeRun = () => {
  const route = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const viewRef = useRef(null);
  const [image, setImage] = useState('');
  const { firstRouteCoordinates, lastRouteCoordinates } = useRun()
  const { distance, calories, duration, max_speed, min_speed, avg_speed, allRoutes } = useLocalSearchParams() as unknown as RouteParamsStart;
  console.log("useLocalSearchParams "+distance, calories, duration, max_speed, min_speed, avg_speed, allRoutes);
  
  const exampleRoute = [
    { latitude: Number(firstRouteCoordinates?.latitude || 0), longitude: Number(firstRouteCoordinates?.longitude || 0) },
    { latitude: Number(lastRouteCoordinates?.latitude || 0), longitude: Number(lastRouteCoordinates?.longitude || 0) },
  ];

  const parsedRoutes = JSON.parse(allRoutes);

  const routeCoordinates = parsedRoutes?.map((coord: { latitude: any; longitude: any; }) => ({
    latitude: coord.latitude,
    longitude: coord.longitude,
  }));

  const onShare = async () => {
   /*  try {
      setImage('teste');
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      if (uri) {
        const base64Image = await RNFS.readFile(uri, 'base64');
        const dataUri = `data:image/png;base64,${base64Image}`;

        await Share.open({
            title: 'Compartilhar Captura de Tela',
            message: 'Compartilhar Captura de Tela',
            url: dataUri,
        });
      } else {
        console.error('CaptureRef returned an empty uri');
      }

      setImage('');
    } catch (error) {
      console.error('Error sharing screenshot: ', error);
    } */
  };


  const renderMarkers = () => {
    return (
      <>
        <Marker
          coordinate={{
            latitude: parsedRoutes[0].latitude,
            longitude: parsedRoutes[0].longitude,
          }}
          title="Início"
          description="Início da rota"
          pinColor="red"
        />

        <Marker
          coordinate={{
            latitude: parsedRoutes[parsedRoutes.length - 1].latitude,
            longitude: parsedRoutes[parsedRoutes.length - 1].longitude,
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

  return (
    <SafeAreaView style={styles.container}>
     {/*  <ViewShot ref={viewRef} options={{ format: 'jpg', quality: 1 }} style={{ flex: 1,backgroundColor: colors.background, }}> */}
        <TouchableOpacity
          onPress={() => route.push('/dashboard')}
          style={styles.backButton}
        >
          {/* <Icon name="keyboard-arrow-left" size={24} color="#888888" /> */}
        </TouchableOpacity>

        <View style={[styles.mapContainer, { paddingTop: 5 }]}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: parsedRoutes[0]?.latitude,
              longitude: parsedRoutes[0]?.longitude,
              latitudeDelta: 0.005,
            longitudeDelta: 0.005
            }}
            mapPadding={{ top: 200, right: 0, bottom: 0, left: 0 }}
          >
            <Polyline
              coordinates={routeCoordinates?.map((route: { latitude: any; longitude: any; }) => ({
                latitude: route.latitude,
                longitude: route.longitude,
              }))}
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
        {image? 
          <FreeRunInfo
            maxSpeed={max_speed}
            minSpeed={min_speed}
            avgSpeed={avg_speed}
            timeTotal={formatToMinutes(duration)}
            calorias={Number(calories).toFixed(2)}
            totalDistance={distance}
            onShare={onShare}
          />
          :null}
        <View style={styles.navigationBar}>
          <NavigationBar />
        </View>
      {/* </ViewShot> */}
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
});

export default FreeRun;
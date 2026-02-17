import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import MapView, { Polyline, Marker} from 'react-native-maps';
import { colors } from "@/constants/Screen";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRun, useRunGps } from '../contexts/RunContext';
import { useAuth } from '@/contexts/AuthContext';
import CustomButton from './customButton';

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const MapArea = (props: { start?: boolean, dashboard: boolean, card?: boolean, initialLocation?: any, skill?: any[] }) => {
  const {
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
    isLoadingLocation,
    initializeLocation,
  } = useRun();
  const { location, routeCoordinates, firstRouteCoordinates } = useRunGps();
  const { appVersion } = useAuth();
  
  const navigation = useNavigation<any>();

  const toggleRun = useCallback(async () => {
    if(isRunning){
      console.log("AQQQ");
      
      if(props.dashboard){
      console.log("AQQQ D");

        return navigation.navigate('Run' as never);
      }
      
      await stopRun()
    }else{
      await startRun() 
    }
  }, [isRunning, startRun, stopRun, navigation, props.dashboard]);

  useEffect(() =>{
    if(!locationForegroundPermissions?.granted){
      return
    }

    startWatchingPosition();

    return () => stopWatchingPosition();
  }, [locationForegroundPermissions, startWatchingPosition, stopWatchingPosition]);

  useFocusEffect(
    useCallback(() => {
      initializeLocation()
    }, [initializeLocation])
  );

  const containerStyles = useMemo(() => [
    styles.mapContainer,
    props.dashboard && styles.dashboardMapContainer,
  ], [props.dashboard]);

  const mapStyles = useMemo(() => [
    styles.map,
    props.dashboard && styles.dashboardMap,
  ], [props.dashboard]);

  const actionContainerStyles = useMemo(() => [
    styles.customButton,
    props.dashboard && styles.dashboardActionButton,
  ], [props.dashboard]);

  const polylineCoordinates = useMemo(() => {
    if (!routeCoordinates || routeCoordinates.length === 0) return [];
    return routeCoordinates.map(route => ({
      latitude: route.latitude,
      longitude: route.longitude,
    }));
  }, [routeCoordinates]);

  if(isLoadingLocation){
    return (
      <View>
        <ActivityIndicator></ActivityIndicator>
      </View>
    )
  }

  return (
    <View style={containerStyles}>
      <Text style={styles.versionText}>{appVersion}</Text>
      {showItems && (
        <Modal transparent={true} visible={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                <Text>Items resgatados!</Text>
                <TouchableOpacity onPress={() => handleCloseShowItems()}>
                  <Text style={styles.closeButtonText}>✖</Text>
                </TouchableOpacity>
              </View>
              
              {
                spawnedBoxItems?.map((item) =>{
                  return (
                    <View key={item.id}>
                      <ExpoImage
                        source={{ uri: item.picture }}
                        style={styles.itemImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemRarity}>{item.rarity}</Text>
                    </View>
                  )
                })
              }
            </View>
          </View>
        </Modal>
      )}
      {location && locationForegroundPermissions?.granted ? (    
        <MapView
          style={mapStyles}
          ref={mapRef}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }}
          showsMyLocationButton
          customMapStyle={!props.dashboard ? darkMapStyle : undefined}
        >
          {
            location && (
              <Marker 
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
              >
                <Image
                  source={require('../assets/icons/run-icon.png')}
                  style={{ width: 36, height: 36 }}
                  resizeMode="contain"
                />
              </Marker>
            )
          }
          {
            isRunning && firstRouteCoordinates && (
              <Marker 
                coordinate={{
                  latitude: firstRouteCoordinates.latitude,
                  longitude: firstRouteCoordinates.longitude
                }}
                tracksViewChanges={false}
              />
            )
          }
          {isRunning && polylineCoordinates.length > 0 && (
            <Polyline
              coordinates={polylineCoordinates}
              strokeColor="#FF0000" 
              strokeWidth={3}
            />
          )}
          {isRunning && spawnedBox && (
            <Marker
              coordinate={{
                latitude: spawnedBox?.latitude,
                longitude: spawnedBox?.longitude
              }}
              title="Recompensa!"
              description="Pegue essa caixa de recompensa 🏆"
              image={require('../assets/icons/move.png')}
              tracksViewChanges={false}
            />
          )}
        </MapView>
      ) : (
        <View style={{flex: 1, display: 'flex',justifyContent: 'center', alignItems: 'center', paddingLeft: 20}}>
          <View>
            <Text>Erro ao obter localização do usuário. Você precisa permitir que o aplicativo tenha acesso a localização.</Text>
          </View>
        </View>
      )}

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
        <View style={actionContainerStyles}>
          
          <CustomButton title={isRunning ? 'Voltar para a corrida' : 'Iniciar Corrida'} onPress={() => toggleRun()} style={isRunning ? styles.buttonStop : styles.button} loading={loading} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333',
  },
  itemImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemRarity: {
    fontSize: 16,
    color: 'gray',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'column'
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customButton: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  dashboardMapContainer: {
    borderWidth: 0,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#E8F4EC',
  },
  dashboardMap: {
    borderRadius: 28,
  },
  dashboardActionButton: {
    paddingHorizontal: 24,
    paddingBottom: 20,
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
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    top: 240,
    right: 30, // só usa um dos dois: left ou right
    bottom: 450,
    zIndex: 10,
  },
  
 /*  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
  }, */
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
  /* closeButton: {
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
  }, */
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

export default React.memo(MapArea);

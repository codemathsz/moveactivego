import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    location,
    isRunning,
    startRun,
    stopRun,
    routeCoordinates,
    mapRef,
    loading,
    spawnedBoxItems,
    showItems,
    handleCloseShowItems,
    spawnedBox,
    firstRouteCoordinates
  } = useRun()
  const { appVersion } = useAuth();
  
  const navigation = useNavigation<any>();



  const toggleRun = async () => {
    if(isRunning){
      if(props.dashboard){
        return navigation.navigate('Run' as never);
      }
      
      await stopRun()
    }else{
      await startRun() 
    }
  };

  useEffect(() =>{
    if(location){
      mapRef.current?.animateCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 70,
      });
    }
  },[location])

    return (
      <View style={styles.mapContainer}>
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
                        <Image source={{ uri: item.picture }} style={styles.itemImage} />
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
        {location ? (    
          <MapView
            style={[styles.map]}
            ref={mapRef}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005
            }}
            showsMyLocationButton
          >
            {
              location && (
                <Marker 
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                  }}
                  anchor={{ x: 0.5, y: 0.5 }}
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
            {isRunning && spawnedBox && (
              <Marker
                coordinate={{
                  latitude: spawnedBox?.latitude,
                  longitude: spawnedBox?.longitude
                }}
                title="Recompensa!"
                description="Pegue essa caixa de recompensa 🏆"
                image={require('../assets/icons/move.png')}
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

export default MapArea;

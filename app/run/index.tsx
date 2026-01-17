import React, { useLayoutEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapArea from '../../components/mapArea';
import RunBottomSheet from '../../components/RunBottomSheet';
import SpeedCard from '../../components/SpeedCard';
import CountdownScreen from '../../components/CountdownScreen';
import { colors } from '../../constants/Screen';
import { useNavigation } from '@react-navigation/native';
import { useRun } from '../../contexts/RunContext';
import Ionicons from '@expo/vector-icons/Ionicons';

interface RouteParams {
  isRunning?: boolean
}

interface RouteParamsStart {
  start?: boolean
}

interface RouteParamsLocation {
  location: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

const RunScreen = () => {
  const navigation = useNavigation();
  const { stopRun, formattedTimer, distance, calories, location, timer } = useRun();
  const [showCountdown, setShowCountdown] = useState(timer === 0);

  useLayoutEffect(() => {
    if (showCountdown) {
      navigation.setOptions({ headerShown: false });
    } else {
      navigation.setOptions({
        headerShown: true,
        headerTransparent: true,
        headerTitle: 'Corrida',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          color: '#FFFFFF',
          fontFamily: 'Inter-Bold',
          fontSize: 18,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Dashboard' as never)}
            style={styles.backButton}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons name="chevron-back" size={24} color="#11CF6A" />
            </View>
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: 'transparent',
        },
      });
    }
  }, [showCountdown, navigation]);

  const handleCountdownComplete = () => {
    setShowCountdown(false);
  };

  const handlePause = async () => {
    await stopRun();
  };

  const getCurrentSpeed = () => {
    if (location?.coords?.speed) {
      const speedKmh = (location.coords.speed || 0) * 3.6;
      // Se a velocidade for negativa ou menor que 0.5 km/h, retornar 0
      return speedKmh > 0.5 ? speedKmh.toFixed(2) : '0.00';
    }
    return '0.00';
  };

  if (showCountdown) {
    return <CountdownScreen onComplete={handleCountdownComplete} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Mapa em tela cheia */}
      <View style={styles.mapFullScreen}>
        <MapArea start={true} dashboard={false} card={true}/>
      </View>

      {/* Card de velocidade */}
      <SpeedCard speed={getCurrentSpeed()} />

      {/* Bottom Sheet com estatísticas */}
      <RunBottomSheet
        time={formattedTimer || '00:00'}
        distance={distance?.toFixed(2) || '0.00'}
        calories={calories?.toString() || '0'}
        missions="0/0"
        onPause={handlePause}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mapFullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    marginLeft: 16,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(17, 207, 106, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RunScreen;
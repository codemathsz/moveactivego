import React, { useLayoutEffect, useEffect, useRef } from 'react';
import { StatusBar, StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import MapArea from '../../components/mapArea';
import RunSummaryBottomSheet from '../../components/RunSummaryBottomSheet';
import { useNavigation } from '@react-navigation/native';
import { useRun } from '../../contexts/RunContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const RunSummaryScreen = () => {
  const navigation = useNavigation();
  const { formattedTimer, distance, calories, routeCoordinates, finishedRunData } = useRun();
  const viewRef = useRef<any>();

  const handleBackToDashboard = () => {
    // Navegar para Dashboard (o finishedRunData será mantido para mostrar os dados)
    navigation.navigate('Dashboard' as never);
  };

  const onShare = async () => {
    try {
      if (!viewRef.current) {
        console.error('ViewRef não está disponível');
        return;
      }

      const uri = await captureRef(viewRef, {
        format: 'jpg',
        quality: 1,
      });

      if (uri) {
        if (Platform.OS === 'android') {
          await Sharing.shareAsync(`file://${uri}`);
        } else {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
          }
        }
      } else {
        console.error('CaptureRef retornou um URI vazio');
      }
    } catch (error) {
      console.log('Erro ao compartilhar:', error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: '',
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleBackToDashboard}
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
  }, [navigation]);

  // Calcular horários
  const getTimeInfo = () => {
    if (finishedRunData?.start_date && finishedRunData?.end_date) {
      // Usar dados da API
      const startDate = new Date(finishedRunData.start_date);
      const endDate = new Date(finishedRunData.end_date);
      
      const startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      
      return { startTime, endTime };
    }
    
    // Fallback: calcular com base no timer
    const now = new Date();
    const endTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Extrair minutos do formattedTimer (formato "HH:MM" ou "MM:SS")
    const timerParts = (formattedTimer || '00:00').split(':');
    const durationMinutes = parseInt(timerParts[0]) * 60 + parseInt(timerParts[1]);
    
    const startDate = new Date(now.getTime() - durationMinutes * 60000);
    const startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
    
    return { startTime, endTime };
  };

  // Calcular passos (1400 passos por km)
  const calculateSteps = () => {
    return Math.round((distance || 0) * 1400).toLocaleString('pt-BR');
  };

  // Calcular velocidades
  const calculateSpeeds = () => {
    if (!routeCoordinates || routeCoordinates.length === 0) {
      return { max: '0.00', avg: '0.00', min: '0.00' };
    }

    const speeds = routeCoordinates
      .map(coord => coord.speed || 0)
      .filter(speed => speed > 0);

    if (speeds.length === 0) {
      return { max: '0.00', avg: '0.00', min: '0.00' };
    }

    const max = Math.max(...speeds) * 3.6; // m/s para km/h
    const min = Math.min(...speeds) * 3.6;
    const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length * 3.6;

    return {
      max: max.toFixed(2),
      avg: avg.toFixed(2),
      min: min.toFixed(2),
    };
  };

  const { startTime, endTime } = getTimeInfo();
  const speeds = calculateSpeeds();

  return (
    <ViewShot ref={viewRef} options={{ format: 'jpg', quality: 1 }} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Mapa em tela cheia */}
      <View style={styles.mapFullScreen}>
        <MapArea start={false} dashboard={false} card={true} />
      </View>

      {/* Bottom Sheet com resumo */}
      <RunSummaryBottomSheet
        distance={(distance || 0).toFixed(2)}
        startTime={startTime}
        endTime={endTime}
        duration={formattedTimer || '00:00'}
        calories={(calories || 0).toString()}
        steps={calculateSteps()}
        maxSpeed={speeds.max}
        avgSpeed={speeds.avg}
        minSpeed={speeds.min}
        onShare={onShare}
      />
    </ViewShot>
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

export default RunSummaryScreen;

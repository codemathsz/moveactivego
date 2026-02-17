import React, { useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import { StatusBar, StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import MapArea from '../../components/mapArea';
import RunSummaryBottomSheet from '../../components/RunSummaryBottomSheet';
import { useNavigation } from '@react-navigation/native';
import { useRun, useRunGps, useRunMetrics } from '../../contexts/RunContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const RunSummaryScreen = () => {
  const navigation = useNavigation();
  const { finishedRunData } = useRun();
  const { formattedTimer, distance, calories } = useRunMetrics();
  const { routeCoordinates } = useRunGps();
  const viewRef = useRef<any>();

  const handleBackToDashboard = useCallback(() => {
    navigation.navigate('Dashboard' as never);
  }, [navigation]);

  const onShare = useCallback(async () => {
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
        } else if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
      } else {
        console.error('CaptureRef retornou um URI vazio');
      }
    } catch (error) {
      console.log('Erro ao compartilhar:', error);
    }
  }, []);

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
  }, [navigation, handleBackToDashboard]);

  const timeInfo = useMemo(() => {
    if (finishedRunData?.start_date && finishedRunData?.end_date) {
      const startDate = new Date(finishedRunData.start_date);
      const endDate = new Date(finishedRunData.end_date);

      const startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      return { startTime, endTime };
    }

    const now = new Date();
    const endTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const timerParts = (formattedTimer || '00:00').split(':');
    const durationMinutes = parseInt(timerParts[0]) * 60 + parseInt(timerParts[1]);

    const startDate = new Date(now.getTime() - durationMinutes * 60000);
    const startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

    return { startTime, endTime };
  }, [finishedRunData?.start_date, finishedRunData?.end_date, formattedTimer]);

  const steps = useMemo(() => {
    return Math.round((distance || 0) * 1400).toLocaleString('pt-BR');
  }, [distance]);

  const speeds = useMemo(() => {
    if (!routeCoordinates || routeCoordinates.length === 0) {
      return { max: '0.00', avg: '0.00', min: '0.00' };
    }

    const speeds = routeCoordinates
      .map(coord => coord.speed || 0)
      .filter(speed => speed > 0);

    if (speeds.length === 0) {
      return { max: '0.00', avg: '0.00', min: '0.00' };
    }

    const max = Math.max(...speeds) * 3.6;
    const min = Math.min(...speeds) * 3.6;
    const avg = (speeds.reduce((a, b) => a + b, 0) / speeds.length) * 3.6;

    return {
      max: max.toFixed(2),
      avg: avg.toFixed(2),
      min: min.toFixed(2),
    };
  }, [routeCoordinates]);

  const { startTime, endTime } = timeInfo;

  return (
    <ViewShot ref={viewRef} options={{ format: 'jpg', quality: 1 }} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.mapFullScreen}>
        <MapArea start={false} dashboard={false} card={true} />
      </View>

      <RunSummaryBottomSheet
        distance={(distance || 0).toFixed(2)}
        startTime={startTime}
        endTime={endTime}
        duration={formattedTimer || '00:00'}
        calories={(calories || 0).toString()}
        steps={steps}
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
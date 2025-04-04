import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import MapArea from '../../components/mapArea';
import NavigationBar from '../../components/navigationBar';
import RunBar from '../../components/RunBar';
import { colors } from '../../constants/Screen';

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

  const [distance, setDistance] = useState(0);
  let distanceInfo = (info: any) => {
    setDistance(info);
  };
  const [speed, setSpeed] = useState(0);
  let speedInfo = (info: any) => {
    setSpeed(info);
  };

  const [calories, setCalories] = useState(0);
  let caloriesInfo = (info: any) => {
    setCalories(info);
  };

  const [time, setTime] = useState(0);
  let timeInfo = (info: any) => {
    setTime(info);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statsBar}>
        <RunBar/>
      </View>
      <MapArea start={true} dashboard={false}/>
      <View style={styles.navigationBar}>
        <NavigationBar />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsBar: {
    marginHorizontal: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 0,
  },
  skillCardStack: {
    marginRight: 16,
    gap: 16,
  },
  shoeCardContainer: {
    flex: 0.70
  },
  mapContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  navigationBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  toggleButton: {
    position: 'absolute',
    right: 20,
  },
});

export default RunScreen;
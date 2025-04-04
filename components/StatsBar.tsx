// StatsBar.js
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
/* import { useProfile } from '../src/contexts/ProfileContext'; */
import { colors } from '../constants/Screen';
/* import { getTotalMission, getUserPointsDay, getUserTotalPoints } from '../src/apis/user.api'; */
/* import { useAuth } from '../src/contexts/AuthContext'; */

const StatsBar = () => {
/*   const { profile, userInfo } = useProfile(); */
  const levelIcon = require('../assets/icons/move-green-icon.png');
  const energyIcon = require('../assets/icons/energy-icon.png');
  const coinsIcon = require('../assets/icons/coins-icon.png');
/*   const { user, jwt } = useAuth(); */
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [totalMission, setTotalMission] = useState<number>(0);
  const [missionCompleted, setMissionCompleted] = useState<number>(0);
  const [width, setWidth] = useState<string>('0');

  /* useEffect(() => {
    getUserPoints();
  }, []); */

  /* const getUserPoints = async () => {
    try {
      if (jwt) {
        const total = await getUserTotalPoints(jwt);
        if(total){
          setTotalPoints(Number(total))
        }
        const totalMissions = await getTotalMission(jwt)
        if(totalMissions){
          setTotalMission(Number(total))
        }
        const userPoints = await getUserPointsDay(jwt);
				if (totalMissions > 0) {
					const completedMissions = userPoints.length;
          setMissionCompleted(userPoints.length)
					const percentageCompleted = (completedMissions / totalMissions) * 100;
					setWidth(percentageCompleted.toFixed(2));
				}
      } else {
        console.error("Token JWT é nulo.");
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  }; */
  
  const calculateWidth = (percentage: string) => {
		return `${percentage}%`;
	  };

	const progressBarWidth = calculateWidth(width);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.itemLeft}>
          <Image source={levelIcon} style={styles.icon} />
          <Text style={styles.text}>Level 1000</Text>
        </View>
        <View style={styles.itemRight}>
          {/* <View style={styles.row}>
            <Image source={coinsIcon} style={styles.icon} />
            <Text style={styles.text}>{totalPoints || 0}</Text>
          </View> */}
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Missões diárias</Text>
        <Text style={styles.value}>{missionCompleted}/{totalMission}</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: progressBarWidth }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain'
  },
  text: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: '#4c4c4c',
  },
  label: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: '#4c4c4c',
    marginTop: 12,
  },
  value: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: '#4c4c4c',
    marginTop: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '20%',
    height: '100%',
    backgroundColor: '#FFCC00',
    borderRadius: 5,
  },
});

export default StatsBar;
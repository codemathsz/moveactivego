/* import { SegmentedArc } from '@shipt/segmented-arc-for-react-native'; */
import React, { useEffect, useState } from 'react';
import { DimensionValue, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/Screen';
import { useAuth } from '../contexts/AuthContext';
import { getTotalMission, getUserPointsDay, getUserTotalPoints } from '../apis/user.api';
import { useRun } from '../contexts/RunContext';

interface RunStatProps {
  image: any;
  value: string | number;
  label: string;

}

const RunBar = ({time}: any) => {
  const { formattedTimer, distance, calories } = useRun()
  const segments = [
    {
      filledColor: '#3FDC81',
      emptyColor: '#F2F3F5',
    },
  ];

  const { user, jwt } = useAuth();
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [totalMission, setTotalMission] = useState<number>(0);
  const [width, setWidth] = useState<string>('0');

 /*  useEffect(() => {
    getUserPoints();
  }, []); */

  const getUserPoints = async () => {
    try {
      if (jwt) {
        const total = await getUserTotalPoints(jwt);
        if (total) {
          setTotalPoints(Number(total))
        }
        const totalMissions = await getTotalMission(jwt)
        if (totalMissions) {
          setTotalMission(Number(total))
        }
        const userPoints = await getUserPointsDay(jwt);
        if (totalMissions > 0) {
          const completedMissions = userPoints.length;
          const percentageCompleted = (completedMissions / totalMissions) * 100;
          setWidth(percentageCompleted.toFixed(2));
        }
      } else {
        console.error("Token JWT é nulo.");
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const calculateWidth = (percentage: string) => {
    return `${percentage}%`;
  };

  const progressBarWidth = calculateWidth(width);

  const RunStat = ({ image, value, label }: RunStatProps) => {
  
    return (
      <View style={styles.lightBackground}>
        <Image source={image} style={{ width: 24, height: 24 }} />
        <Text style={styles.statValueText}>{value}</Text>
        <Text style={styles.smallLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {/* <SegmentedArc
          segments={segments}
          fillValue={velocidade.velocidade}
          isAnimated={true}
          animationDelay={1000}
        >
          {(props) => (
            <View style={[styles.lightBackground]}>
              <Text style={styles.averageSpeedText}>{velocidade.velocidade || 0}</Text>
              <Text style={[styles.smallLabel, { marginBottom: 5 }]}>Km/h</Text>
            </View>

          )}
        </SegmentedArc> */}

        <View style={styles.row}>
          <Text style={styles.label}>Missões diárias</Text>
          <Text style={styles.value}>{totalPoints}/{totalMission}</Text>
        </View>

        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: progressBarWidth as DimensionValue}]} />
        </View>

        <View style={styles.separator} />

        <View style={styles.infoCard}>
          <View style={styles.statsArray}>
            <RunStat image={require('../assets/icons/ongoing-run-distance-icon.png')} value={distance.toFixed(2) + ' Km' || '0 km'} label="Distância" />
            <RunStat image={require('../assets/icons/ongoing-run-duration-icon.png')} value={formattedTimer} label="Duração" />
            <RunStat image={require('../assets/icons/ongoing-run-calories-icon.png')} value={calories?.toFixed(0) || 0} label="Calorias" />
          </View>
        </View>


      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
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
  averageSpeedText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    color: colors.textPrimary,
    lineHeight: 36,
  },
  smallLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#888888',
  },
  lightBackground: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  statsArray: {
    flexDirection: 'row',
  },
  infoCard: {
    position: 'relative',
    top: 20
  },
  statValueText: {
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
    fontSize: 18,
    marginTop: 8,
  },
  separator: {
    marginTop: 36,
    borderBottomWidth: 1,
    borderColor: '#BCBEC9',
  },
});

export default RunBar;
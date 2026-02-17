import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const DailyMissionCard = () => {
  const { userTotals } = useAuth();
  const [targetSteps] = useState<number>(8000);
  const [missionsCompleted, setMissionsCompleted] = useState<number>(19);
  const [totalMissions] = useState<number>(50);

  const currentSteps = useMemo(
    () => Math.floor((userTotals?.total_distance || 0) * 1400),
    [userTotals?.total_distance]
  );

  const progressPercentage = Math.min((missionsCompleted / totalMissions) * 100, 100);

  return (
    <LinearGradient
      colors={['#11CF6A', '#278E50']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="medal-outline" size={24} color="#FFFFFF" />
      </View>
      
      <Text style={styles.stepsValue}>
        {(currentSteps / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} 
        <Text style={styles.stepsTarget}> /{targetSteps.toLocaleString('pt-BR')} passos</Text>
      </Text>
      
      <View style={styles.footer}>
        <Text style={styles.label}>Missões diárias</Text>
        <Text style={styles.missionsCount}>{missionsCompleted}/{totalMissions}</Text>
      </View>
      
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: 12,
    width: 24,
    height: 24,
  },
  stepsValue: {
    fontSize: 38,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 52,
  },
  stepsTarget: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  missionsCount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#292A2E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EAEAEA',
    borderRadius: 4,
  },
});

export default React.memo(DailyMissionCard);

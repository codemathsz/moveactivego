import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { getUser } from '../apis/user.api';

const DailyMissionCard = () => {
  const { jwt } = useAuth();
  const [currentSteps, setCurrentSteps] = useState<number>(0);
  const [targetSteps] = useState<number>(8000);
  const [missionsCompleted, setMissionsCompleted] = useState<number>(19);
  const [totalMissions] = useState<number>(50);

  const fetchUserData = async () => {
    try {
      if (jwt) {
        const userInfo = await getUser(jwt);
        // Converter distância em km para passos (aproximadamente 1km = 1400 passos)
        const totalSteps = Math.floor((userInfo?.total_distance || 0) * 1400);
        setCurrentSteps(totalSteps);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

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

export default DailyMissionCard;

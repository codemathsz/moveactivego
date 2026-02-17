// StatsBar.js
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const StatsBar = () => {
  const { userTotals } = useAuth();
  const steps = useMemo(() => Math.floor((userTotals?.total_distance || 0) * 1400), [userTotals?.total_distance]);
  const calories = useMemo(() => Math.floor(userTotals?.total_calories || 0), [userTotals?.total_calories]);
  const distance = useMemo(() => userTotals?.total_distance || 0, [userTotals?.total_distance]);
  const items = 19;

  return (
    <View style={styles.container}>
      <View style={styles.statCard}>
        <Text style={styles.emoji}>
          <Image source={require('../assets/images/shoe-run.png')} style={{width:32, height:32}} />
        </Text>
        <Text style={styles.value}>{(steps / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</Text>
        <Text style={styles.label}>passos</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.emoji}>
          <Image source={require('../assets/images/fire.png')} style={{width:32, height:32}} />
        </Text>
        <Text style={styles.value}>{calories.toLocaleString('pt-BR')}</Text>
        <Text style={styles.label}>kcal</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.emoji}>
          <MaterialCommunityIcons name="timer-outline" size={24} color="#0088FF" />
        </Text>
        <Text style={styles.value}>{distance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</Text>
        <Text style={styles.label}>km</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.emoji}>
          <Ionicons name="medal-outline" size={24} color="#12131A" />
        </Text>
        <Text style={styles.value}>{items}</Text>
        <Text style={styles.label}>itens</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ECF8ED',
    borderRadius: 18,
    padding: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#212121',
    marginBottom: 2,
    lineHeight: 28
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#7C7D82',
  },
});

export default React.memo(StatsBar);

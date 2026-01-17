import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

interface RunSummaryBottomSheetProps {
  distance: string;
  startTime: string;
  endTime: string;
  duration: string;
  calories: string;
  steps: string;
  maxSpeed: string;
  avgSpeed: string;
  minSpeed: string;
  onShare?: () => void;
}

const RunSummaryBottomSheet = ({
  distance,
  startTime,
  endTime,
  duration,
  calories,
  steps,
  maxSpeed,
  avgSpeed,
  minSpeed,
  onShare,
}: RunSummaryBottomSheetProps) => {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Título com botão compartilhar */}
        <View style={styles.titleContainer}>
          <View style={{ width: 32 }} />
          <Text style={styles.title}>Corrida Livre</Text>
          <TouchableOpacity onPress={onShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Informações principais */}
        <View style={styles.mainInfo}>
          <View style={styles.iconContainer}>
            <Ionicons name="walk" size={28} color="#000000" />
          </View>
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceValue}>{distance} km</Text>
            <Text style={styles.dateTime}>Hoje {startTime} - {endTime}</Text>
          </View>
        </View>

        {/* Detalhes do exercício */}
        <TouchableOpacity style={styles.detailsSection} activeOpacity={0.7}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Detalhes do exercício</Text>
            <Ionicons name="chevron-forward" size={20} color="#000000" />
          </View>

          <View style={styles.metricsGrid}>
            {/* Linha 1 */}
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Duração</Text>
                <Text style={styles.metricValue}>{duration}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Calorias</Text>
                <Text style={styles.metricValue}>{calories} <Text style={styles.metricUnit}>Kcal</Text></Text>
              </View>
            </View>

            {/* Linha 2 */}
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Passos</Text>
                <Text style={styles.metricValue}>{steps}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Velocidade máxima</Text>
                <Text style={styles.metricValue}>{maxSpeed} <Text style={styles.metricUnit}>km</Text></Text>
              </View>
            </View>

            {/* Linha 3 */}
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Velocidade média</Text>
                <Text style={styles.metricValue}>{avgSpeed} <Text style={styles.metricUnit}>km/h</Text></Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Velocidade mínima</Text>
                <Text style={styles.metricValue}>{minSpeed} <Text style={styles.metricUnit}>km</Text></Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Card de Missões */}
        <LinearGradient
          colors={['#11CF6A', '#278E50']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.missionCard}
        >
          <View style={styles.missionHeader}>
            <Ionicons name="medal-outline" size={20} color="#FFFFFF" />
            <Text style={styles.missionTitle}>Missões</Text>
            <Text style={styles.missionCount}>0/0</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '0%' }]} />
          </View>
          <Text style={styles.missionSubtitle}>Continue correndo para completar missões!</Text>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#292A2E',
    textAlign: 'center',
    flex: 1,
  },
  shareButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ECF8ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceContainer: {
    flex: 1,
  },
  distanceValue: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#898996',
  },
  detailsSection: {
    backgroundColor: '#F2F2F3',
    borderRadius: 18,
    padding: 20,
    marginTop: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  metricsGrid: {
    gap: 20,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#898996',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#278E50',
  },
  metricUnit: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#278E50',
  },
  missionCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  missionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  missionCount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#292A2E',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#EAEAEA',
    borderRadius: 3,
  },
  missionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
});

export default RunSummaryBottomSheet;



import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/Screen';


interface RunStatProps {
  image: any;
  value: string;
  label: string;
  color: string;
}

interface FreeRunInfoProps{
  maxSpeed: string
  minSpeed: string
  avgSpeed: string
  timeTotal: string
  calorias: string
  totalDistance: string
  onShare: () => Promise<void>
}

const RunStat = ({ image, value, label, color }: RunStatProps) => {
  return (
    <View style={styles.cardInfo}>
      <Image source={image} style={{ width: 20, height: 20, top: 4 }} />
      <View style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Text style={[styles.statValueText, { color: color }]}>{value}</Text>
        <Text style={[{ fontSize: 8, textAlign: 'center' }]}>{label}</Text>
      </View>
    </View>
  );
}

const getCurrentDateFormatted = () => {
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours());
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const month = months[currentDate.getMonth()];
  const day = currentDate.getDate();
  const year = currentDate.getFullYear();
  const hour = String(currentDate.getHours()).padStart(2, '0');

  const minute = String(currentDate.getMinutes()).padStart(2, '0');

  return `${day} de ${month} de ${year} às ${hour}:${minute}`;
};

const FreeRunInfo = ({
  avgSpeed,
  calorias,
  maxSpeed,
  minSpeed,
  timeTotal,
  totalDistance,
  onShare
}: FreeRunInfoProps) => {
  const [image, setImage] = useState('');

  return (
      <View style={styles.cardsContainer}>
        <View style={[styles.lightBackground, styles.averageSpeed, styles.infoCard, { bottom: 720, flexDirection: 'row', alignItems: 'center', flex: 0.70 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('../assets/icons/runGrey.png')} style={{ width: 18, height: 18 }} />
            <View style={{ marginLeft: 8 }}>
              <Text style={[styles.smallLabel, { fontSize: 11 }]}>Corrida</Text>
              <Text style={[styles.cardSmallLabel]}>{getCurrentDateFormatted()}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => onShare && onShare()} >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 14 }}>
              <View style={{ marginLeft: 110, alignItems: 'center' }}>
                <Image source={require('../assets/icons/share.png')} style={{ width: 14, height: 14 }} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.statsArray}>
          <RunStat image={require('../assets/icons/minSpeed.png')} value={minSpeed || 0 + ' KM'} label="Velocidade mínima" color='#555555' />
          <RunStat image={require('../assets/icons/averageSpeed.png')} value={avgSpeed || 0 + ' KM'} label="Velocidade média" color='#3FDC81' />
          <RunStat image={require('../assets/icons/maxSpeed.png')} value={maxSpeed || 0 + ' KM'} label="Velocidade máxima" color='#555555' />
          <RunStat image={require('../assets/icons/total-time-icon.png')} value={timeTotal || '00:00'} label="Duração" color='#FC457B' />
          <RunStat image={require('../assets/icons/total-distance-icon.png')} value={totalDistance || '0'} label="Corridos" color='#FFB905' />
          <RunStat image={require('../assets/icons/caloriesBlue.png')} value={calorias || '0'} label="Calorias" color='#006FDD' />
        </View>
      </View>
    
  );
};

const styles = StyleSheet.create({
  cardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoCard: {
    position: 'absolute',
    bottom: 64,
    left: 16,
    right: 16,
    backgroundColor: '#F9F9F9',
    gap: 16,
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  lightBackground: {
    flex: 1,
    backgroundColor: 'rgb(198, 223, 239)',
    borderRadius: 16,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    width: '13%',
    backgroundColor: 'rgb(206, 227, 239)',
    padding: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  smallLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#888888',
  },
  cardSmallLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 8,
    color: '#888888',
  },
  averageSpeed: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  averageSpeedText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: colors.textPrimary,
    lineHeight: 36,
  },
  statsArray: {
    flexDirection: 'row',
    bottom: 280,
    gap: 18,
    paddingHorizontal: 2,
  },
  statValueText: {
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
    fontSize: 11,
    marginTop: 8,
  }
});

export default FreeRunInfo;
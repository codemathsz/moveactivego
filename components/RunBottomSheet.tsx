import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View, Dimensions } from 'react-native';
import CustomButton from './customButton';
import Ionicons from '@expo/vector-icons/Ionicons';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MIN_HEIGHT = 180;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.65;

interface RunBottomSheetProps {
  time: string;
  distance: string;
  calories: string;
  missions: string;
  onPause: () => void;
}

const RunBottomSheet = ({ time, distance, calories, missions, onPause }: RunBottomSheetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0 || (gestureState.dy < 0 && isExpanded)) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          // Arrastar para baixo - minimizar
          collapseSheet();
        } else if (gestureState.dy < -50) {
          // Arrastar para cima - expandir
          expandSheet();
        } else {
          // Voltar para o estado atual
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const expandSheet = () => {
    setIsExpanded(true);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const collapseSheet = () => {
    setIsExpanded(false);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: isExpanded ? MAX_HEIGHT : MIN_HEIGHT,
          transform: [{ translateY }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Handle bar */}
      <View style={styles.handleBar} />

      {/* Cards de estatísticas */}
      <View style={styles.statsContainer}>
        {/* Primeira linha - sempre visível */}
        <View style={styles.row}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color="#FFFFFF" />
            <Text style={styles.statLabel}>Tempo</Text>
            <Text style={styles.statValue}>{time}</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="navigate-outline" size={24} color="#FFFFFF" />
            <Text style={styles.statLabel}>Distância</Text>
            <Text style={styles.statValue}>{distance} <Text style={styles.statUnit}>Km</Text></Text>
          </View>
        </View>

        {/* Segunda linha - visível apenas quando expandido */}
        {isExpanded && (
          <>
            <View style={styles.row}>
              <View style={styles.statCard}>
                <Ionicons name="flame-outline" size={24} color="#FFFFFF" />
                <Text style={styles.statLabel}>Calorias</Text>
                <Text style={styles.statValue}>{calories} <Text style={styles.statUnit}>Kcal</Text></Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="medal-outline" size={24} color="#FFFFFF" />
                <Text style={styles.statLabel}>Missões</Text>
                <Text style={styles.statValue}>{missions}</Text>
              </View>
            </View>

            {/* Botão de pausar */}
            <View style={styles.buttonContainer}>
              <CustomButton
                onPress={onPause}
                icon={<Ionicons name="pause" size={28} color="#FFFFFF" />}
              />
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#161725',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#3A3B4C',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1F2029',
    borderWidth: 1,
    borderColor: 'rgba(17, 207, 106, 0.3)',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#898996',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Inter-ExtraBold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  statUnit: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#898996',
  },
  buttonContainer: {
    marginTop: 16,
  },
});

export default React.memo(RunBottomSheet);

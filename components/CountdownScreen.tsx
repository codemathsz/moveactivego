import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, StatusBar } from 'react-native';

interface CountdownScreenProps {
  onComplete: () => void;
}

const CountdownScreen = ({ onComplete }: CountdownScreenProps) => {
  const [count, setCount] = useState(3);
  const rotation1 = useRef(new Animated.Value(0)).current;
  const rotation2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação dos círculos
    Animated.loop(
      Animated.timing(rotation1, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(rotation2, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();

    // Contagem regressiva
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const spin1 = rotation1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spin2 = rotation2.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '540deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#11CF6A" />
      <View style={styles.circleContainer}>
        {/* Semicírculo verde escuro */}
        <Animated.View
          style={[
            styles.semicircle,
            styles.semicircleGreen,
            { transform: [{ rotate: spin1 }] },
          ]}
        />
        
        {/* Semicírculo branco */}
        <Animated.View
          style={[
            styles.semicircle,
            styles.semicircleWhite,
            { transform: [{ rotate: spin2 }] },
          ]}
        />

        {/* Número da contagem */}
        {count > 0 && <Text style={styles.countText}>{count}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#11CF6A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  circleContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  semicircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 16,
    borderStyle: 'solid',
  },
  semicircleGreen: {
    borderColor: 'transparent',
    borderTopColor: '#278E50',
    borderRightColor: '#278E50',
  },
  semicircleWhite: {
    borderColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
  },
  countText: {
    fontSize: 128,
    fontFamily: 'Inter-ExtraBold',
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    zIndex: 10,
  },
});

export default CountdownScreen;

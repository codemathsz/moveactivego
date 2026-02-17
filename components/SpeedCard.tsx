import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SpeedCardProps {
  speed: string;
}

const SpeedCard = ({ speed }: SpeedCardProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.speedValue}>{speed}</Text>
      <Text style={styles.speedUnit}>Km/h</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: '#11cf6a60',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  speedValue: {
    fontSize: 64,
    fontFamily: 'Inter-SemiBold',
    color: '#FFF',
    lineHeight: 72,
    letterSpacing: -2,
  },
  speedUnit: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: 1,
  },
});

export default React.memo(SpeedCard);

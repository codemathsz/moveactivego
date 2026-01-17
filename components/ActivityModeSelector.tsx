import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ActivityMode = 'walk' | 'run' | 'bike';

interface ActivityModeSelectorProps {
  onModeChange?: (mode: ActivityMode) => void;
}

const ActivityModeSelector = ({ onModeChange }: ActivityModeSelectorProps) => {
  const [selectedMode, setSelectedMode] = useState<ActivityMode>('run');

  const handleModePress = (mode: ActivityMode) => {
    setSelectedMode(mode);
    onModeChange?.(mode);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.modeButton, selectedMode === 'walk' && styles.selectedButton]}
        onPress={() => handleModePress('walk')}
      >
        <Text style={styles.icon}>
            <Image source={require('../assets/images/shoe-run.png')} style={{width:20, height:20}} />
        </Text>
        <Text style={[styles.label, selectedMode === 'walk' && styles.selectedLabel]}>
          Caminhada
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.modeButton, selectedMode === 'run' && styles.selectedButton]}
        onPress={() => handleModePress('run')}
      >
        <Text style={styles.icon}><Image source={require('../assets/images/shoe-run.png')} style={{width:20, height:20}} /></Text>
        <Text style={[styles.label, selectedMode === 'run' && styles.selectedLabel]}>
          Corrida
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.modeButton, selectedMode === 'bike' && styles.selectedButton]}
        onPress={() => handleModePress('bike')}
      >
        <Text style={styles.icon}>
            <Image source={require('../assets/images/cycling-track.png')} style={{width:18, height:18}} />
        </Text>
        <Text style={[styles.label, selectedMode === 'bike' && styles.selectedLabel]}>
          Bicicleta
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFFF0',
    borderRadius: 150,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    gap: 8,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E7EC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: '#11CF6A40',
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  selectedLabel: {
    fontFamily: 'Inter-SemiBold',
    color: '#278E50',
  },
});

export default ActivityModeSelector;

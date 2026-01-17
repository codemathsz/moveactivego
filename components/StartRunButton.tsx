import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StartRunButtonProps {
  onPress?: () => void;
}

const StartRunButton = ({ onPress }: StartRunButtonProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Iniciar Corrida</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    backgroundColor: '#0BB974',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0BB974',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default StartRunButton;

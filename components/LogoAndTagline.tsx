import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const LogoAndTagline = ({ style = {} }) => {
  return (
    <View style={{ ...styles.root, ...style }}>
      <Image
        source={require('../assets/images/logo.png')}
        resizeMode="contain"
      />

      <Text style={styles.tagline}>Leve sua motivação para o próximo nível</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 64
  },
  tagline: {
    fontFamily: 'Poppins-SemiBold',
    fontWeight: 'bold',
    fontSize: 22,
    lineHeight: 22,
    color: '#000',
    textAlign: 'center',
    flexWrap: 'wrap',
    maxWidth: 250,
  },
});

export default LogoAndTagline;
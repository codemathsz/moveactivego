import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const LogoAndTagline = ({ style = {} }) => {
  return (
    <View style={{ ...styles.root, ...style }}>
      <Image
        source={require('../assets/images/ColoredLogo.png')}
        style={styles.logo}
      />

      <Text style={styles.tagline}>Leve sua motivação para o próximo nível.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  logo: {
    width: 147,
    height: 42,
    alignSelf: 'center',
    marginVertical: 32,
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    maxWidth: 200,
  },
});

export default LogoAndTagline;
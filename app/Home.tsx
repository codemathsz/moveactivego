import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../components/customButton';

const HomeScreen = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigation = useNavigation<any>();

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  return (
    <ImageBackground
      source={require('../assets/images/HomeBackground.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo-white.png')}
            resizeMode="contain"
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.tagline}>
            A move vai te mostrar que você pode tudo!
          </Text>

          <View style={styles.buttonsContainer}>
            <CustomButton
              title="Começar"
              onPress={handleLoginPress}
              styleView={{ padding: 8}}
              type="primary"
            />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  logoContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  tagline: {
    fontSize: 48,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 43,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
});

export default HomeScreen;
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ImageBackground, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../components/customButton';

const HomeScreen = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigation = useNavigation<any>();
  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/images/HomeBackground.png')}
        style={styles.backgroundImage}
      />

      <View style={styles.buttonsContainer}>
        <Text style={styles.tagline}>Leve sua motivação para o próximo nível.</Text>

        <CustomButton
          title="Crie sua conta"
          onPress={handleRegisterPress}
          textStyle={{ textAlign: 'left', alignItems: 'center' }}
          styleView={{ flex: 1, justifyContent: 'flex-start', paddingHorizontal: 8 }}
          type="primary"
        />

        <CustomButton
          title="Já tem uma conta? Entre!"
          onPress={handleLoginPress}
          textStyle={{ textAlign: 'left', alignItems: 'center' }}
          styleView={{ flex: 1, justifyContent: 'flex-start', paddingHorizontal: 8 }}
          type="secondary"
        />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  buttonsContainer: {
    fontFamily: 'Poppins-Regular',
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 48,
    gap: 16
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    textAlign: 'left',
  },
});

export default HomeScreen;
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from 'react-native-root-toast';
import CustomLabel from '../../components/customLabel';
import { useAuth } from '../../contexts/AuthContext';
import LogoAndTagline from '../../components/LogoAndTagline';
import CustomButton from '@/components/customButton';
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)
  const { login } = useAuth();

  const handleLoginPress = async () => {
    setLoading(true)
    const response = await login({ email, password }).catch(() =>{
      Toast.show("Usuario ou senha inválido", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        shadow: true,
        animation: true,
        hideOnPress: true,
      });
    })
    setLoading(false)
    console.log(response);
    
    if(response){
      Toast.show(response, {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        shadow: true,
        animation: true,
        hideOnPress: true,
      });
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate("Recuperar senha")
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <LogoAndTagline />
          <View style={{ marginTop: 24 }}>
            <CustomLabel text='E-mail' />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder='Email@email.com'
                placeholderTextColor='#CCCCCC'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            <CustomLabel text='Senha' />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder='Insira sua senha'
                placeholderTextColor='#CCCCCC'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize='none'
              />
              <TouchableOpacity
                onPress={() => setShowPassword(prev => !prev)}
                style={{
                  width: 40,
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                {
                  password ? !showPassword ? (

                    <AntDesign name="eye" size={24} color="black" />
                  ) : (

                    <Entypo name="eye-with-line" size={24} color="black" />
                  ) : null
                }
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => handleRegisterPress()}
            >
              <Text style={styles.forgotPassword}>Esqueceu sua senha?</Text>
            </TouchableOpacity>
          </View>
          <CustomButton title='Entrar' onPress={() => handleLoginPress()} style={{ marginBottom: 16, marginHorizontal: 16 }} loading={loading} />
        </View>
      </ScrollView>

    </KeyboardAvoidingView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  forgotPassword: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#4c4c4c",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    fontFamily: "Poppins-Regular",
    flex: 1,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    borderRadius: 8,
    color: 'black'
  },
});

export default LoginScreen;
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInputMask } from "react-native-masked-text";
import MaskInput, { Masks } from "react-native-mask-input";
import Toast from "react-native-root-toast";
import { register } from "../../apis/user.api";
import { UserRegister } from "../../interfaces/user.interface";
import LogoAndTagline from "../../components/LogoAndTagline";
import CustomButton from "@/components/customButton";
import CustomLabel from "@/components/customLabel";
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import CountryPicker from 'react-native-country-picker-modal';

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation<any>();
  const [countryCode, setCountryCode] = useState('BR');
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const birthdateRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleRegisterPress = async () => {
    if (!name || !email || !birthdate || !password || !confirmPassword || !phone) {
      if(Platform.OS){
        Alert.alert("Preencha todos os campos")
      }else{
        Toast.show("Preencha todos os campos", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.CENTER,
          shadow: true,
          animation: true,
          hideOnPress: true,
        });
      }
      
      return;
    } else if (password !== confirmPassword) {
      if(Platform.OS){
        Alert.alert("As senhas não coincidem")
      }else{
        Toast.show("As senhas não coincidem", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.CENTER,
          shadow: true,
          animation: true,
          hideOnPress: true,
        });
      }
      return;
    }else if(password.length < 9){
      if(Platform.OS){
        Alert.alert("A senha deve conter no minimo 9 caracteres.")
      }else{
        Toast.show("A senha deve conter no minimo 9 caracteres.", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.CENTER,
          shadow: true,
          animation: true,
          hideOnPress: true,
        });
      }
    } else {
      const [day, month, year] = birthdate.split("/");
      const user: UserRegister = {
        name: name,
        email: email,
        birthdate: `${year}-${month}-${day}`,
        password: password,
        phone: phone,
      };
      setLoading(true)
      
      try {
        const response = await register(user)
        if(response["success"]){
          navigation.navigate("Verification", { email: email });
        }else{
          const firstErrorField = Object.keys(response.errors)[0]; // Acessa o primeiro campo com erro
          const firstErrorMessage = response.errors[firstErrorField][0]
          if(Platform.OS){
            Alert.alert(firstErrorMessage)
          }else{
            Toast.show(firstErrorMessage, {
              duration: Toast.durations.SHORT,
              position: Toast.positions.CENTER,
              shadow: true,
              animation: true,
              hideOnPress: true,
            });
          }
        }
        //navigation.navigate("Login");
        setLoading(false)
      } catch (error:any) {
        Toast.show("Erro desconhecido. Tente novamente mais tarde.", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.CENTER,
          shadow: true,
          animation: true,
          hideOnPress: true,
        });
        setLoading(false)
      }
    }
  };

  const handleChange = (text: string) => {
    const parsed = parsePhoneNumberFromString(text, countryCode as CountryCode);
    setPhone(parsed ? parsed.formatInternational() : text);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <LogoAndTagline />

        <View style={styles.formContainer}>
          <CustomLabel text='Nome' />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder='Nome e sobrenome'
              placeholderTextColor='#CCCCCC'
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current.focus()}
            />
            {/* ICONE */}
          </View>

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
                ref={emailRef}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current.focus()}
              />
            {/* ICONE */}
          </View>

          <CustomLabel text='Celular' />
          <View style={styles.inputContainer}>
            <CountryPicker
              countryCode={countryCode as any}
              withFilter
              withFlag
              withCallingCode
              onSelect={(country) => setCountryCode(country.cca2)}
            />
            <TextInput
              style={styles.input}
              placeholder="Número de telefone"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={handleChange}
            />
            {/* ICONE */}
          </View>

          <CustomLabel text='Data de Nascimento' />
          <View style={styles.inputContainer}>
            <MaskInput
              style={styles.input}
              placeholder='00/00/00'
              placeholderTextColor='#CCCCCC'
              value={birthdate}
              onChangeText={setBirthdate}
              mask={Masks.DATE_DDMMYYYY}
              ref={birthdateRef}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current.focus()}
            />
            {/* ICONE */}
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
              ref={passwordRef}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current.focus()}
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

          <CustomLabel text='Confirme sua senha' />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder='Insira sua senha'
              placeholderTextColor='#CCCCCC'
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize='none'
              ref={confirmPasswordRef}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(prev => !prev)}
              style={{
                width: 40,
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              {
                confirmPassword ? !showConfirmPassword ? (

                  <AntDesign name="eye" size={24} color="black" />
                ) : (

                  <Entypo name="eye-with-line" size={24} color="black" />
                ) : null
              }
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginBottom: 10 }}>
          <CustomButton title='Criar conta' onPress={() => handleRegisterPress()} loading={loading} />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    color: "#4c4c4c",
    marginBottom: 5,
  },
  formContainer: {
    marginBottom: 32,
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
    borderWidth: 0,
    fontSize: 16,
    borderRadius: 8,
    paddingVertical:4,
    paddingHorizontal: 2,
    color: 'black'
  },
});

export default RegisterScreen;

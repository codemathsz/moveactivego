import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "@/components/CustomInput";
import { colors } from "@/constants/Screen";
import { BLACK } from "@/constants/Colors";
import CustomCheckbox from "@/components/CustomCheckbox";

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
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const birthdateRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  

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
    } else if (!acceptedTerms) {
      if(Platform.OS){
        Alert.alert("Você precisa aceitar os termos e condições")
      }else{
        Toast.show("Você precisa aceitar os termos e condições", {
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

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardOpen(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardOpen(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView style={{ flex: 1 , backgroundColor: '#FFFFFF'}} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={{ flex: 1, marginTop: 24}}>
            <LogoAndTagline text="Cadastre-se" />

            <View style={styles.inputContainer}>
              <CustomInput 
                label="Nome"
                placeholder="Nome e sobrenome"
                value={name}
                onChange={setName}
                propsInput={{
                  returnKeyType: 'next',
                  onSubmitEditing: () => emailRef.current!.focus()
                }}
              />

              <CustomInput 
                label="E-mail"
                placeholder="Insira seu email"
                value={email}
                onChange={setEmail}
                ref={emailRef}
                propsInput={{
                  returnKeyType: 'next',
                  keyboardType: 'email-address',
                  autoCapitalize: 'none',
                  onSubmitEditing: () => phoneRef.current!.focus()
                }}
              />
            
              <View style={styles.root}>
                <CustomLabel text='Celular' />
                <View style={styles.phoneContainer}>
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
                </View>
              </View>

              <CustomInput 
                label="Data de Nascimento"
                placeholder="00/00/0000"
                value={birthdate}
                onChange={setBirthdate}
                mask={true}
                ref={birthdateRef}
                propsInput={{
                  returnKeyType: 'next',
                  onSubmitEditing: () => passwordRef.current!.focus()
                }}
              />

              <CustomInput 
                label="Senha"
                placeholder="Insira sua senha"
                value={password}
                onChange={setPassword}
                secureTextEntry={!showPassword}
                ref={passwordRef}
                propsInput={{
                  autoCapitalize: 'none',
                  returnKeyType: 'next',
                  onSubmitEditing: () => confirmPasswordRef.current!.focus()
                }}
              />

              <CustomInput 
                label="Confirme sua senha"
                placeholder="Insira sua senha"
                value={confirmPassword}
                onChange={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                ref={confirmPasswordRef}
                propsInput={{
                  autoCapitalize: 'none',
                  returnKeyType: 'done',
                  onSubmitEditing: () => confirmPasswordRef.current!.focus()
                }}
              />
              
              <View style={{ marginBottom: 10 }}>
                <CustomButton
                  title='Cadastre-se' 
                  onPress={() => handleRegisterPress()} 
                  styleView={{ padding: 8}}
                  type="primary"
                  style={{ width: '100%', marginBottom: keyboardOpen ? 36 : 16}} 
                  loading={loading} 
                />
                <View style={styles.termsContainer}>
                  <CustomCheckbox
                    checked={acceptedTerms}
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                    size={20}
                  />
                  <TouchableOpacity 
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                    style={{ flex: 1, marginLeft: 8 }}
                  >
                    <Text style={styles.textTerms}>
                      Eu li e concordo com o{' '}
                      <Text style={styles.textTermsLink}>Contrato do Software</Text>
                      {' '}e a{' '}
                      <Text style={styles.textTermsLink}>Política de Privacidade</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
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
    flex: 1,
    marginTop: 24,
    flexDirection: "column",
    gap: 16,
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
  root: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    flexDirection: 'column',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  textTerms: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: BLACK,
    lineHeight: 20,
  },
  textTermsLink: {
    textDecorationLine: 'underline',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default RegisterScreen;

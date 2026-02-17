import React, { useEffect, useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import CustomLabel from '../../components/customLabel';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LogoAndTagline from '../../components/LogoAndTagline';
import CustomButton from '@/components/customButton';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from "@react-navigation/native";
import { requestCode } from "@/apis/user.api";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "@/components/CustomInput";
import { GRAY, GRAY_1, GRAY_DARK } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword] = useState(false);
  const [loading, setLoading] = useState(false)
  const { login } = useAuth();
  const { showError, showWarning, showInfo } = useToast();

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("E-mail é obrigatório");
      showError("Por favor, insira seu e-mail");
      isValid = false;
    } else if (!validateEmail(email.trim())) {
      setEmailError("E-mail inválido");
      showError("Por favor, insira um e-mail válido");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Senha é obrigatória");
      if (isValid) showError("Por favor, insira sua senha");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Senha deve ter no mínimo 6 caracteres");
      if (isValid) showError("A senha deve ter no mínimo 6 caracteres");
      isValid = false;
    }

    return isValid;
  };

  const handleLoginPress = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await login(email, password);
      
      // Se response é null, login foi bem sucedido
      // Se response é uma string, é uma mensagem de erro
      if (response === null) {
        // Login bem sucedido, não precisa fazer nada
        // O AuthContext já vai atualizar o estado e redirecionar
        return;
      }
      
      // Se chegou aqui, houve um erro
      if (response === "Email não verificado. Por favor, verifique seu email antes de fazer login.") {
        try {
          const responseRequestCode = await requestCode(email.trim(), "email_confirmation");
          
          if (responseRequestCode.success) {
            showWarning("Conta não verificada. Um novo código foi enviado para seu email.");
            navigation.navigate("Verification", { email: email.trim() });
          } else {
            showError("Conta não verificada. Erro ao enviar código de verificação.");
          }
        } catch (error) {
          console.error("Erro ao enviar código:", error);
          showError("Erro ao enviar código de verificação. Tente novamente.");
        }
      } else {
        // Exibe a mensagem de erro retornada pela API
        showError(response || "Usuário ou senha inválidos");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      showError("Erro ao fazer login. Verifique sua conexão e tente novamente.");
    } finally {
      // Garante que o loading sempre vai parar
      setLoading(false);
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  const handleRecoverPasswordPress = () => {
    navigation.navigate("Recuperar senha")
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <SafeAreaView style={{ flex: 1 , backgroundColor: '#FFFFFF'}} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <LogoAndTagline />
            <View style={{  flex: 1, marginTop: 64, gap: 48 }}>
              <View style={styles.inputContainer}>
                <CustomInput 
                  label="E-mail"
                  placeholder="Insira seu email"
                  value={email}
                  onChange={setEmail}
                />

                <CustomInput 
                  label="Senha"
                  placeholder="Insira sua senha"
                  value={password}
                  onChange={setPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
              <View style={styles.inputContainer}>  
                <CustomButton
                  title='Entrar' 
                  onPress={() => handleLoginPress()} 
                  styleView={{ padding: 8}}
                  type="primary"
                  style={{ width: '100%', marginBottom: keyboardOpen ? 36 : 16}} 
                  loading={loading} 
                />
                <CustomButton
                  title='Cadastre-se' 
                  onPress={() => handleRegisterPress()} 
                  styleView={{ padding: 8}}
                  type="gray"
                  style={{ width: '100%', marginBottom: keyboardOpen ? 36 : 16}} 
                />
                <TouchableOpacity
                  onPress={() => handleRecoverPasswordPress()}
                >
                  <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
                </TouchableOpacity>
                <View style={styles.orContainer}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>ou</Text>
                  <View style={styles.orLine} />
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
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  scrollViewContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  forgotPassword: {
    fontSize: 17,
    fontFamily: Fonts.inter.medium,
    color: GRAY_DARK,
    textAlign: "center",
    marginTop: 8,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: GRAY,
  },
  orText: {
    fontSize: 16,
    fontFamily: Fonts.inter.medium,
    color: GRAY_1,
    marginHorizontal: 12,
    textTransform: 'uppercase'
  },
  inputContainer: {
    gap: 24,
  }
});

export default LoginScreen;
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
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

  const handleRegisterPress = async () => {
    if (!name || !email || !birthdate || !password || !confirmPassword || !phone) {
      Toast.show("Preencha todos os campos", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        shadow: true,
        animation: true,
        hideOnPress: true,
      });
      return;
    } else if (password !== confirmPassword) {
      Toast.show("As senhas não coincidem", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        shadow: true,
        animation: true,
        hideOnPress: true,
      });
      return;
    }else if(password.length < 9){
      Toast.show("A senha deve conter no minimo 9 caracteres.", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        shadow: true,
        animation: true,
        hideOnPress: true,
      });
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
        await register(user)
        //navigation.navigate("Login");
        navigation.navigate("Verification", { email: email });
        setLoading(false)
      } catch (error:any) {
        Toast.show("Email ja cadastrado", {
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
            />
            {/* ICONE */}
          </View>

          <CustomLabel text='Celular' />
          <View style={styles.inputContainer}>
            <TextInputMask
              style={styles.input}
              placeholder='99-99999999'
              placeholderTextColor='#CCCCCC'
              type={'cel-phone'}
              value={phone}
              onChangeText={setPhone}
              keyboardType='phone-pad'
              autoCapitalize='none'
              options={{
                maskType: 'BRL',
                withDDD: true,
                dddMask: '(99) '
              }}
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
            />
            <TouchableOpacity
              onPress={() => setShowPassword(prev => !prev)}
              style={{
                width: 40,
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              {/* ICONE */}
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
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(prev => !prev)}
              style={{
                width: 40,
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              {/* ICONE */}
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
    color: 'black'
  },
});

export default RegisterScreen;

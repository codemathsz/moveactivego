import { 
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView, 
  StyleSheet, 
  Text ,
  TouchableOpacity,
  View
} from "react-native";
import { colors } from "../../constants/Screen";
import LogoAndTagline from "../../components/LogoAndTagline";
import CustomInput from "../../components/CustomInput"
import { useEffect, useState } from "react";
import { requestCode, resetPasswordConfirmation } from "../../apis/user.api";
import { useAuth } from "../../contexts/AuthContext";
import { ResetPasswordConfirmation } from "../../interfaces/reset-password-confirmation.interface";
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field";
import Toast from "react-native-root-toast";
import { useRouter } from "expo-router";

const ResetPassword = () =>{
  const router = useRouter()
  const CELL_COUNT = 5;
  const [sendEmail, setSendEmail] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const [newPassword, setNewPassword] = useState<string>('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('')
  const [error, setError] = useState<string>('')
  const {jwt} = useAuth()

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  
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

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChangePassword = async () =>{
    setError('')
    if(!sendEmail){
      if(!isValidEmail(email)) return setError('Insira um email válido')
      const response = await requestCode(email, "password_reset")
      setSendEmail(true)
    }else{
      if (newPassword !== newPasswordConfirm) {
        Toast.show("As senhas não coincidem", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.CENTER,
          shadow: true,
          animation: true,
          hideOnPress: true,
        });
        return;
      }else if(newPassword.length < 9){
        Toast.show("A senha deve conter no minimo 9 caracteres.", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.CENTER,
          shadow: true,
          animation: true,
          hideOnPress: true,
        });
      } 
      const dto: ResetPasswordConfirmation = {
        email,
        code: value,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirm
      }
      const response = await resetPasswordConfirmation(jwt!, dto)
      if(response)
        router.push("/login")
    }
  }
  return(
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.root}>
          {sendEmail ? (
            <Text>
              <Text style={styles.title}>
                <Text>Enviamos um código de verificação para o e-mail </Text>
                <Text style={{ color: colors.primary }}>{email}</Text>
              </Text>
              <Text style={styles.title}>Insira o código e sua nova senha</Text>
            </Text>
          ) : (
            <View style={{width:'100%'}}>
              <LogoAndTagline />
              <Text style={styles.title}>
                Para redefinir sua <Text style={styles.strong}>senha</Text>, insira seu <Text style={styles.strong}>email</Text> abaixo. Enviaremos um código de verificação para você.
              </Text>
            </View>
          )}

          <View style={styles.wFull}>
            {!sendEmail ? (
              <CustomInput
                label="Email"
                placeholder="email@example.com"
                onChange={setEmail}
              />
            ) : (
              <View style={styles.fields}>
                <View style={{width: '100%',display: 'flex',alignItems: 'center', justifyContent: 'center'}}>
                <CodeField
                  ref={ref}
                  {...props}
                  value={value}
                  onChangeText={setValue}
                  cellCount={CELL_COUNT}
                  rootStyle={styles.codeFieldRoot}
                  keyboardType='number-pad'
                  textContentType='oneTimeCode'
                  renderCell={({ index, symbol, isFocused }) => (
                    <Text
                      key={index}
                      style={[styles.cell, isFocused && styles.focusCell]}
                      onLayout={getCellOnLayoutHandler(index)}
                    >
                      {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                  )}
                  />
                </View>
                <CustomInput
                  label="Nova senha"
                  placeholder="Digite"
                  secureTextEntry={true}
                  onChange={setNewPassword}
                />
                <CustomInput
                  label="Confirme a nova senha"
                  placeholder="Digite"
                  secureTextEntry={true}
                  onChange={setNewPasswordConfirm}
                />    
              </View>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity
              style={[styles.button, { marginTop: 16, marginBottom: keyboardOpen ? 20 : 0 }]}
              onPress={handleChangePassword}>
              <View style={styles.buttonContent}>
                <Text style={styles.primaryText}>{sendEmail ? 'Alterar' : 'Enviar código'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  root: {
    width: '100%',
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },  
  title:{
    width: '100%',
    color: colors.textPrimary,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    marginBottom: 32,
  },
  strong:{
    fontWeight: 'bold',
  },
  wFull:{
    width: '100%'
  },
  fields:{
    width: '100%',
    flex: 1,
    display: 'flex',
    gap: 8,
  },
  passwordButton: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 24,
    color: colors.primary,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 16,
  },

  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: colors.primary,
  },

  icon: {
    marginRight: 16,
    marginBottom: 12,
  },
  codeFieldRoot: {
    width: '80%',
    marginBottom: 24,
    gap: 8,
  },
  cell: {
    width: 40,
    height: 40,
    fontSize: 20,
    lineHeight: 46,
    fontFamily: "Poppins-Regular",
    borderWidth: 2,
    borderRadius: 8,
    borderColor: "#ccc",
    textAlign: "center",
  },
  focusCell: {
    borderColor: colors.primary,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  primaryText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    lineHeight: 24,
    letterSpacing: 1.4,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  successText: {
    color: 'green',
    marginBottom: 10,
    fontFamily: 'Poppins-Bold',
  },

});

export default ResetPassword;
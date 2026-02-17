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
import { useToast } from "../../contexts/ToastContext";
import { ResetPasswordConfirmation } from "../../interfaces/reset-password-confirmation.interface";
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "@/components/customButton";
import { Fonts } from "@/constants/Fonts";

const ResetPassword = () =>{
  const navigation = useNavigation<any>()
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
  const { showError, showSuccess } = useToast();

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
        showError("As senhas não coincidem");
        return;
      }else if(newPassword.length < 9){
        showError("A senha deve conter no mínimo 9 caracteres.");
        return;
      } 
      const dto: ResetPasswordConfirmation = {
        email,
        code: value,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirm
      }
      try {
        const response = await resetPasswordConfirmation(jwt!, dto)
        if(response) {
          showSuccess("Senha alterada com sucesso!");
          navigation.navigate("Login" as any)
        }
      } catch (error) {
        console.error("Erro ao resetar senha:", error);
        showError("Erro ao resetar senha. Verifique o código e tente novamente.");
      }
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
          <View>
            {sendEmail ? (
              <View>
                <LogoAndTagline text=""/>

                <Text style={styles.title}>
                  Enviamos um código de verificação para o e-mail{' '}
                  <Text style={{ color: colors.primary, fontFamily: Fonts.inter.semiBold }}>{email}</Text>
                </Text>
                <Text style={styles.title}>Insira o código e sua nova senha</Text>
              </View>
            ) : (
              <View style={{alignItems: 'center', gap: 64}}>
                <LogoAndTagline text="Redefinir senha"/>
                <Text style={styles.title}>
                  Para redefinir sua <Text style={styles.strong}>senha</Text>, insira seu <Text style={styles.strong}>email</Text> abaixo. Enviaremos um código de verificação para você.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.wFull}>
            {!sendEmail ? (
              <CustomInput
                label="Email"
                placeholder="email@example.com"
                value={email}
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
                  placeholder="Digite sua nova senha"
                  secureTextEntry={true}
                  onChange={setNewPassword}
                />
                <CustomInput
                  label="Confirme a nova senha"
                  placeholder="Digite novamente"
                  secureTextEntry={true}
                  onChange={setNewPasswordConfirm}
                />    
              </View>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
            <CustomButton
              title={sendEmail ? 'Alterar senha' : 'Enviar código'}
              onPress={() => handleChangePassword()} 
              styleView={{ padding: 8}}
              type="primary"
              style={{ width: '100%', marginBottom: keyboardOpen ? 36 : 16}} 
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
    backgroundColor: "#FFFFFF",
  },
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: 'space-between',
    gap: 32,
    paddingTop: 60,
  },  
  title:{
    width: '100%',
    textAlign: 'center',
    color: colors.textPrimary,
    fontFamily: Fonts.inter.regular,
    fontSize: 16,
    marginTop: 24,
    lineHeight: 24,
  },
  strong:{
    fontFamily: Fonts.inter.semiBold,
  },
  wFull:{
    flex: 1,
    justifyContent: 'flex-start',
    gap: 24,
  },
  fields:{
    width: '100%',
    flex: 1,
    display: 'flex',
    gap: 16,
  },
  passwordButton: {
    fontFamily: Fonts.inter.regular,
    fontSize: 14,
    lineHeight: 24,
    color: colors.primary,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 16,
  },

  button: {
    padding: 16,
    borderRadius: 25,
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
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  cell: {
    width: 48,
    height: 48,
    fontSize: 24,
    lineHeight: 48,
    fontFamily: Fonts.inter.semiBold,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: "#D1D1D1",
    textAlign: "center",
    color: colors.textPrimary,
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
    fontFamily: Fonts.inter.bold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  errorText: {
    color: 'red',
    fontFamily: Fonts.inter.regular,
    fontSize: 14,
    marginTop: 8,
  },
  successText: {
    color: 'green',
    marginBottom: 10,
    fontFamily: Fonts.inter.bold,
  },

});

export default ResetPassword;
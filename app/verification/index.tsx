import { RouteProp, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field";
import Toast from "react-native-root-toast";
import LogoAndTagline from "../../components/LogoAndTagline";
import CustomButton from "../../components/customButton";
import { colors } from "../../constants/Screen";
import { confirmRegistration, verifyEmail } from "../../apis/user.api";
import { UserConfirmation } from "../../interfaces/user-confirmation.interface";
import { UserVerifyEmailWithCode } from "../../interfaces/user-verify-email";

type RootStackParamList = {
  Verification: { email: string };
};

type VerificationScreenRouteProp = RouteProp<RootStackParamList, 'Verification'>;

type Props = {
  route: VerificationScreenRouteProp;
};

const CELL_COUNT = 5;

const VerificationScreen: React.FC<Props> = ({ route }) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const { email } = route.params;
  const handleRegisterPress = async () => {
    setLoading(true);

    const user: UserVerifyEmailWithCode = {
      email: email,
      code: value,
      type: "email_confirmation"
    };

    try {
      const response = await verifyEmail(user);
      setLoading(false);
      if (response)
        navigation.navigate("Login");
    } catch (error) {
      setLoading(false);
      console.log('Registration error:', error);
      let toast = Toast.show("Codigo inválido", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        shadow: true,
        animation: true,
        hideOnPress: true,
      });
    }

  };

  const navigation = useNavigation<any>();

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8 }}>
          <TouchableOpacity style={{ marginTop: -50 }} onPress={() => {
            navigation.navigate("Home");
          }}>
            {/* ICON */}
          </TouchableOpacity>
          <LogoAndTagline style={{ flex: 1 }} />
          <View></View>
        </View>
        <Text style={styles.title}>Confirme seu cadastro</Text>
        <Text style={styles.description}>
          <Text>Enviamos um código de verificação para o e-mail </Text>
          <Text style={{ color: colors.primary }}>{email}</Text>
        </Text>

        <Text style={styles.description}>Insira o código para validar seu cadastro</Text>

        <CodeField
          ref={ref}
          {...props}
          // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
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

      <CustomButton
        title='Validar Código'
        loading={loading}
        onPress={() => {
          handleRegisterPress();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 21,
    fontFamily: "Poppins-Bold",
    color: "#4c4c4c",
    marginBottom: 32,
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#4c4c4c",
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  codeInput: {
    width: 40,
    height: 50,
    borderWidth: 1,
    borderColor: "grey",
    textAlign: "center",
  },

  codeFieldRoot: {
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
    color: '#4c4c4c',
  },
  focusCell: {
    borderColor: colors.primary,
  },
});

export default VerificationScreen;
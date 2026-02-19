import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../constants/Screen';
import { useAuth } from '../../contexts/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/customButton';
import { updatePassword } from '../../apis/user.api';

const ChangePasswordScreen = () => {
  const navigation = useNavigation<any>();
  const { jwt, user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem');
      return;
    }

    if (!jwt) {
      Alert.alert('Erro', 'Usuário não identificado');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(jwt, {
        password: currentPassword,
        newPassword: newPassword,
      });

      Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);

      // Limpar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      Alert.alert('Erro', error.message || 'Não foi possível alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#373743" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alterar senha</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#373743" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.form}>

            <CustomInput
              label="Nova senha"
              placeholder="Insira sua senha"
              value={newPassword}
              onChange={setNewPassword}
              secureTextEntry={true}
            />

            <CustomInput
              label="Confirme sua nova senha"
              placeholder="Insira sua senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              secureTextEntry={true}
            />
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Salvar"
              onPress={handleSave}
              type="primary"
              loading={loading}
              gradient={true}
              style={styles.saveButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#040415',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 32,
  },
  form: {
    gap: 16,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    marginTop: 32,
    paddingHorizontal: 4,
  },
  saveButton: {
    width: '100%',
  },
});

export default ChangePasswordScreen;

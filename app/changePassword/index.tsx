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
import { useToast } from '../../contexts/ToastContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/customButton';
import { updatePassword } from '../../apis/user.api';

const ChangePasswordScreen = () => {
  const navigation = useNavigation<any>();
  const { jwt, user } = useAuth();
  const { showWarning } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    showWarning('API em manutenção');
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
    paddingTop: 48,
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

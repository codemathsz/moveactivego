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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '../../constants/Screen';
import { useAuth } from '../../contexts/AuthContext';

type OptionType = 'clear' | 'delete' | 'export' | null;

const DeleteAccountScreen = () => {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [selectedOption, setSelectedOption] = useState<OptionType>(null);

  const handleClearData = () => {
    Alert.alert(
      'Limpar dados',
      'Tem certeza que deseja limpar todos os dados? Sua conta será mantida, mas todas as informações serão removidas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar lógica de limpar dados via API
            Alert.alert('Sucesso', 'Dados limpos com sucesso!');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir conta',
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão permanentemente removidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar lógica de excluir conta via API
            Alert.alert('Conta excluída', 'Sua conta foi excluída com sucesso.', [
              {
                text: 'OK',
                onPress: () => {
                  logout();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                  });
                },
              },
            ]);
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Exportar dados',
      'Um arquivo com seus dados pessoais será gerado e enviado para seu e-mail.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportar',
          onPress: () => {
            // TODO: Implementar lógica de exportar dados via API
            Alert.alert('Sucesso', 'Seus dados serão enviados para seu e-mail em breve!');
          },
        },
      ]
    );
  };

  const handleConfirm = () => {
    switch (selectedOption) {
      case 'clear':
        handleClearData();
        break;
      case 'delete':
        handleDeleteAccount();
        break;
      case 'export':
        handleExportData();
        break;
      default:
        Alert.alert('Atenção', 'Por favor, selecione uma opção');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#373743" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Excluir conta</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#373743" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.description}>
            Por favor, selecione a operação que deseja
          </Text>

          {/* Opção 1: Limpar dados */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedOption === 'clear' && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedOption('clear')}
          >
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="cleaning-services" size={24} color="#373743" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Limpar dados</Text>
                <Text style={styles.optionDescription}>
                  Mantenha a conta, enquanto limpa todos os dados
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Opção 2: Excluir conta */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedOption === 'delete' && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedOption('delete')}
          >
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="close-circle-outline" size={24} color="#373743" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Excluir conta</Text>
                <Text style={styles.optionDescription}>
                  Excluir conta e todos os dados completamente
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Opção 3: Exportar dados */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedOption === 'export' && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedOption('export')}
          >
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="share-outline" size={24} color="#373743" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Exportar dados</Text>
                <Text style={styles.optionDescription}>
                  Exportar meus dados pessoais
                </Text>
              </View>
            </View>
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  content: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#373743',
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E6E6E8',
    paddingHorizontal: 16,
    paddingVertical: 32,
    marginBottom: 12,
  },
  optionCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#7C7D82',
    lineHeight: 18,
  },
});

export default DeleteAccountScreen;

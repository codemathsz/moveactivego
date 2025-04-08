import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../constants/Screen';
import { useNavigation } from '@react-navigation/native';

const NavigationBar = () => {
  const navigation = useNavigation<any>();
  const pathname = usePathname(); // Obtém o caminho da rota atual
  const items = [
    { path: 'Dashboard', label: 'Home', icon: 'home-outline' },
    // { path: '/activities', label: 'Corridas', icon: 'albums-outline' },
    // { path: '/carteira', label: 'Carteira', icon: 'wallet-outline' },
    // { path: '/marketplace', label: 'Marketplace', icon: 'cart-outline' },
  ];

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const index = items.findIndex(item => item.path === pathname); // Compara o caminho atual
    setSelectedIndex(index);
  }, [pathname]);

  const handleItemPress = (index: number, path: string) => {
    setSelectedIndex(index);
    navigation.navigate(path as any); // Redireciona para a rota
  };

  return (
    <View>
      <LinearGradient
        colors={['#0BB974', '#038D78']}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.navigationBar}
      >
        {items.map((item, index) => (
          <NavigationItem
            key={index}
            icon={item.icon}
            label={item.label}
            selected={item.path === pathname}
            onPress={() => handleItemPress(index, item.path)}
          />
        ))}
      </LinearGradient>
    </View>
  );
};

const NavigationItem = ({ icon, label, selected, onPress }: any) => {
  return (
    <TouchableOpacity
      style={[
        styles.navigationItem,
        selected && styles.selectedNavigationItem,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={16}
        color={selected ? '#038D78' : '#ffffff'}
        style={styles.navigationIcon}
      />
      {selected && (
        <Text style={styles.navigationText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  navigationBar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  navigationItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  selectedNavigationItem: {
    backgroundColor: 'white',
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginVertical: 8,
  },
  navigationIcon: {
    marginBottom: 4,
  },
  navigationText: {
    color: '#038D78',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    lineHeight: 15.6,
    letterSpacing: 0.323,
    marginLeft: 8,
  },
});

export default NavigationBar;

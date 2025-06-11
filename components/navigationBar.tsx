import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../constants/Screen';
import { useNavigation, useRoute } from '@react-navigation/native';

const NavigationBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const items = [
    { name: 'Dashboard', label: 'Home', icon: 'home-outline' },
    { name: 'Activities', label: 'Corridas', icon: 'albums-outline' },
    { name: 'Inventory', label: 'Inventário', icon: 'cube-outline' },
    // { path: '/carteira', label: 'Carteira', icon: 'wallet-outline' },
    // { path: '/marketplace', label: 'Marketplace', icon: 'cart-outline' },
  ];

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const index = items.findIndex(item => item.name === route.name);
    setSelectedIndex(index);
  }, [route.name]);

  const handleItemPress = (index: number, screen: string) => {
    setSelectedIndex(index);
    navigation.navigate(screen);
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
            selected={item.name === route.name}
            onPress={() => handleItemPress(index, item.name)}
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

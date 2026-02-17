import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import { colors } from '../constants/Screen';
import { useNavigation, useRoute } from '@react-navigation/native';

const NavigationBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const items = [
    { name: 'Dashboard', label: 'Inicio', icon: 'home-outline', iconLib: 'Ionicons' },
    { name: 'Activities', label: 'Corridas', icon: 'walk-sharp', iconLib: 'Ionicons' },
    { name: 'Inventory', label: 'Inventário', icon: 'cube-outline', iconLib: 'Ionicons' },
    { name: 'Profile', label: 'Perfil', icon: 'person', iconLib: 'Octicons' },
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
    <View style={styles.navigationBar}>
      {items.map((item, index) => (
        <NavigationItem
          key={index}
          icon={item.icon}
          iconLib={item.iconLib}
          label={item.label}
          selected={item.name === route.name}
          onPress={() => handleItemPress(index, item.name)}
        />
      ))}
    </View>
  );
};

const NavigationItem = ({ icon, label, selected, onPress, iconLib }: any) => {
  const IconComponent = iconLib === 'Octicons' ? Octicons : Ionicons;
  
  return (
    <TouchableOpacity
      style={styles.navigationItem}
      onPress={onPress}
    >
      <IconComponent
        name={icon}
        size={24}
        color={selected ? '#278E50' : '#7C7D82'}
        style={styles.navigationIcon}
      />
      <Text style={[styles.navigationText, selected && styles.selectedText]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  navigationBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E7EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  navigationItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    flex: 1,
  },
  navigationIcon: {
    marginBottom: 4,
  },
  navigationText: {
    color: '#7C7D82',
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  selectedText: {
    color: '#000000',
  },
});

export default React.memo(NavigationBar);

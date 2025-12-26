import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_GREEN } from '@/constants/Colors';

interface CustomCheckboxProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
  color?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onPress,
  size = 24,
  color = PRIMARY_GREEN,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size * 0.2,
            borderColor: checked ? color : '#E6E6E8',
            backgroundColor: checked ? color : 'transparent',
          },
        ]}
      >
        {checked && (
          <Ionicons name="checkmark" size={size * 0.75} color="white" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomCheckbox;

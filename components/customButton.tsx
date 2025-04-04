import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../constants/Screen';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: string;
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  icon?: any;
  styleView?: StyleProp<ViewStyle>;
  loading?: boolean;
  spinnerColor?: string;
}

const CustomButton = ({
  title,
  onPress,
  type = 'primary',
  textStyle,
  style,
  icon,
  styleView,
  loading = false,
  spinnerColor,
}: CustomButtonProps) => {

  const buttonStyles = [
    styles.button,
    type === 'secondary' ? styles.secondaryButton : styles.primaryButton,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    type === 'secondary' ? styles.secondaryText : styles.primaryText,
    textStyle,
  ];


  return (
    <TouchableOpacity onPress={onPress} style={buttonStyles} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor || styles.primaryText.color} />
      ) : (
        <View style={[styles.buttonContent, styleView]}>
          <Text style={textStyles}>{title}</Text>
          {icon}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    lineHeight: 24,
    letterSpacing: 1.4,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#000000',
  },
});

export default CustomButton;
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
import { LinearGradient } from 'expo-linear-gradient';
import { BLACK, GRAY_DARK, PRIMARY_GREEN, SECONDARY_GREEN, WHITE } from '../constants/Colors';

interface CustomButtonProps {
  title?: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'gray';
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  icon?: any;
  styleView?: StyleProp<ViewStyle>;
  loading?: boolean;
  spinnerColor?: string;
  gradient?: boolean;
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
  gradient = false
}: CustomButtonProps) => {

  const buttonStyles = [
    styles.button,
    type === 'secondary' && styles.secondaryButton,
    type === 'gray' && styles.grayButton,
    !title && styles.iconOnlyButton, 
    style,
  ];

  const textStyles = [
    styles.buttonText,
    type === 'secondary' || type === 'gray' ? styles.secondaryText : styles.primaryText,
    textStyle,
  ];

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor || WHITE} />
      ) : (
        title ? (
          <View style={[styles.buttonContent, styleView]}>
            <Text style={textStyles}>{title}</Text>
            {icon}
          </View>
        ) : (
          <View>
            {icon}
          </View>
        )
      )}
    </>
  );

  if (type === 'primary' && gradient) {
    return (
      <TouchableOpacity onPress={onPress} style={[style]} disabled={loading}>
        <LinearGradient
          colors={[SECONDARY_GREEN, PRIMARY_GREEN]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button]}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyles} disabled={loading}>
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconOnlyButton: {
    padding: 0,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius:   16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: PRIMARY_GREEN,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: PRIMARY_GREEN,
    borderWidth: 1,
  },
  grayButton: {
    backgroundColor: '#E6E7EC',
    borderWidth: 0,
    color: '#292A2E',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontWeight: 'semibold',
    fontSize: 20,
    lineHeight: 24,
  },
  primaryText: {
    color: WHITE,
  },
  secondaryText: {
    color: GRAY_DARK,
  },
});

export default CustomButton;
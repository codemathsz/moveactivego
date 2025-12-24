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
import { BLACK, PRIMARY_GREEN, SECONDARY_GREEN, WHITE } from '../constants/Colors';

interface CustomButtonProps {
  title?: string;
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
    type === 'secondary' && styles.secondaryButton,
    !title && styles.iconOnlyButton, 
    style,
  ];

  const textStyles = [
    styles.buttonText,
    type === 'secondary' ? styles.secondaryText : styles.primaryText,
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

  if (type === 'primary') {
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
    padding: 8,
    borderRadius:   18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: PRIMARY_GREEN,
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 24,
  },
  primaryText: {
    color: WHITE,
  },
  secondaryText: {
    color: BLACK,
  },
});

export default CustomButton;
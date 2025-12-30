import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, TextInputProps} from 'react-native';
import MaskInput, { Masks } from 'react-native-mask-input';
import Icon from '@expo/vector-icons/Entypo';
import IconFeather from '@expo/vector-icons/Feather';
import { colors } from '../constants/Screen';
import CustomLabel from './customLabel';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Fonts } from '@/constants/Fonts';

interface CustomInputProps {
  label: string;
  placeholder: string;
  customIcon?: React.ReactElement<IconProps>;
  editable?: boolean;
  value?: string;
  onChange?: (text: string) => void;
  secureTextEntry?: boolean;
  mask?: boolean;
  keyboard?: string;
  propsInput?: TextInputProps;
  ref?: any;
}

interface IconProps {
  name: string;
  size: number;
  color: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  customIcon,
  editable = true,
  value,
  onChange,
  secureTextEntry = false,
  mask = false,
  keyboard,
  propsInput,
  ref
}) => {
  const CustomIconComponent = customIcon;

  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.root}>
      <CustomLabel text={label} />
      <View>
        {mask ? (
          <View style={styles.inputContainer}>
            <MaskInput
              style={styles.input}
              placeholder={placeholder}
              value={value}
              placeholderTextColor={'black'}
              onChangeText={onChange}
              mask={Masks.DATE_DDMMYYYY}
            />
            <Icon
              name="calendar"
              size={20}
              color="#212121"
            />
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              underlineColorAndroid={'transparent'}
              placeholder={placeholder}
              value={value}
              placeholderTextColor={'gray'}
              onChangeText={onChange}
              editable={editable}
              selectTextOnFocus={editable}
              secureTextEntry={secureTextEntry && !showPassword}
              ref={ref}
              {...propsInput}
            />
            {secureTextEntry && (
              <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                <Ionicons 
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
            {CustomIconComponent && !secureTextEntry && (
              <View>
                {CustomIconComponent}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    flexDirection: 'column',
  },
  inputContainer: {
    color: 'black',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontFamily: Fonts.inter.regular,
    fontSize: 16,
    color: 'black',
    padding: 0
  },
});

export default CustomInput;

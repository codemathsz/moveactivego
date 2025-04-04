import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import MaskInput, { Masks } from 'react-native-mask-input';
import Icon from '@expo/vector-icons/Entypo';
import IconFeather from '@expo/vector-icons/Feather';
import { colors } from '../constants/Screen';
import CustomLabel from './customLabel';

interface CustomInputProps {
  label: string;
  placeholder: string;
  customIcon?: React.ReactElement<IconProps>;
  editable?: boolean;
  onChange?: (text: string) => void;
  secureTextEntry?: boolean;
  mask?: boolean;
  keyboard?: string;
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
  onChange,
  secureTextEntry = false,
  mask = false,
  keyboard
}) => {
  const CustomIconComponent = customIcon;

  const [text, setText] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const change = (text: string) => {
    setText(text);
    if (onChange) {
      onChange(text);
    }
  };

  return (
    <View style={styles.root}>
      <CustomLabel text={label} />
      <View>
        {mask ? (
          <View style={styles.inputContainer}>
            <MaskInput
              style={styles.input}
              placeholder={placeholder}
              value={text}
              placeholderTextColor={'black'}
              onChangeText={change}
              mask={Masks.DATE_DDMMYYYY}
            />
            <Icon
              name="calendar"
              size={20}
              color="#212121"
              style={styles.icon}
            />
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              underlineColorAndroid={'transparent'}
              placeholder={placeholder}
              value={text}
              placeholderTextColor={'gray'}
              onChangeText={change}
              editable={editable}
              selectTextOnFocus={editable}
              secureTextEntry={secureTextEntry && !showPassword}
            />
            {secureTextEntry && (
              <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                <IconFeather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={24}
                  color={colors.textSecondary}
                  style={styles.icon}
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
  root: {},
  inputContainer: {
    borderWidth: 1,
    backgroundColor: "#FFF",
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: 'black',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: 'black',
  },
  icon: {
    marginRight: 16,
    marginBottom: 12,
  },
});

export default CustomInput;

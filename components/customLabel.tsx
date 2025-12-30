import { Fonts } from '@/constants/Fonts';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';

const CustomLabel = ({ text, style }: { text: string, style?: StyleProp<TextStyle> }) => {
    return (
        <View>
            <Text style={[styles.text, style]}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    text: {
        fontSize: 14,
        lineHeight: 22,
        color: '#4C4C4C',
        fontFamily: Fonts.inter.regular,
    },
});

export default CustomLabel;
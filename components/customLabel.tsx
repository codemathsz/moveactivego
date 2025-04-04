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
        color: '#4C4C4C',
        fontFamily: 'Poppins-Bold',
    },
});

export default CustomLabel;
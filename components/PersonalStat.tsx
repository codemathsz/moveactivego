import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const PersonalStat = ({ icon, value, color, description }: any) => {

	return (
		<View style={styles.personalStat}>
			<Image source={icon} style={styles.statIcon} />
			<Text style={[styles.statValue, { color: color }]}>{value}</Text>
			<Text style={styles.statDescription}>{description}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	personalStat: {
		alignItems: 'center',
	},
	statIcon: {
		width: 24,
		height: 24,
		marginBottom: 8,
	},
	statValue: {
		fontFamily: 'Poppins-Bold',
		fontSize: 14,
	},
	statDescription: {
		fontFamily: 'Poppins-Regular',
		fontSize: 10,
		color: '#888888',
	},
});

export default PersonalStat;
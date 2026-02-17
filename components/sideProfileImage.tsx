import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useAuth } from '../contexts/AuthContext';

const SideProfileImage = ({ size = 64, style }: any) => {
	const { user, userTotals } = useAuth();
	const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');

	useEffect(() => {
		setProfilePicture(userTotals?.profilePicture || user?.profilePicture || '');
	}, [userTotals?.profilePicture, user?.profilePicture]);

	return (
		<View style={styles.container}>
			{profilePicture ? (
				<ExpoImage
					source={{ uri: profilePicture }}
					style={[styles.profileImage, style, { width: size, height: size, borderRadius: size / 2 }]}
					contentFit="cover"
					cachePolicy="memory-disk"
				/>
			) : (
				<ExpoImage
					source={require('../assets/images/avatar-placeholder.png')}
					style={[styles.profileImage, style, { width: size, height: size, borderRadius: size / 2 }]}
					contentFit="cover"
					cachePolicy="memory-disk"
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'relative',
		overflow: 'hidden',
	},
	profileImage: {

	},
	editButton: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		borderRadius: 16,
		padding: 8,
		width: 26,
		height: 26,
	},
});

export default SideProfileImage;
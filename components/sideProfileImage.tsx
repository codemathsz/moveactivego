import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getUser } from '../apis/user.api';
import { useAuth } from '../contexts/AuthContext';

const SideProfileImage = ({ size = 64, style }: any) => {
	const { user, jwt } = useAuth();
	const [loading, setLoading] = useState(false);
	const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');

	useEffect(() => {
		if (user) {
		  setProfilePicture(user.profilePicture || '');
		}
	  }, [user]);

	const fetchUserInfo = async () => {
		try {
			if (jwt) {
				const userInfo = await getUser(jwt);
				setProfilePicture(userInfo.profilePicture);
			} else {
				console.error("Token JWT é nulo.");
			}
		} catch (error) {
			console.error("Erro ao buscar informações do usuário:", error);
		}
	};

	useEffect(() => {
		fetchUserInfo();
	}, []);

	return (
		<View style={styles.container}>
			{profilePicture ? (
				<Image source={{ uri: profilePicture }} style={[styles.profileImage, style, { width: size, height: size, borderRadius: size / 2 }]} />
			) : (
				<Image source={require('../assets/images/avatar-placeholder.png')} style={[styles.profileImage, style, { width: size, height: size, borderRadius: size / 2 }]} />
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
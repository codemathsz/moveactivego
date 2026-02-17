import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { launchImageLibrary } from 'react-native-image-picker';
import { updateProfilePicture } from '../apis/user.api';
import { useAuth } from '../contexts/AuthContext';

const ProfileImage = ({ size = 64, style }: any) => {
	const { user, jwt, userTotals, refreshUserTotals } = useAuth();
	const [loading, setLoading] = useState(false);
	const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");

	useEffect(() => {
		setProfilePicture(userTotals?.profilePicture || user?.profilePicture || "");
	}, [userTotals?.profilePicture, user?.profilePicture]);

	useEffect(() => {
		if (profilePicture) {
			ExpoImage.prefetch(profilePicture);
		}
	}, [profilePicture]);

	const handleEditPress = async () => {
		try {

			await launchImageLibrary({
				mediaType: 'photo',
				selectionLimit: 1,
			}, async (response) => {
				console.log('Response = ', response);

				if (!response.didCancel && !response.errorCode) {
					const uri = response?.assets?.[0]?.uri;

					if (uri && jwt && user) {

						setLoading(true);

						try {
							const base64Image = await convertImageToBase64(uri);
							  await updateProfilePicture(jwt, { userId: user.id, profilePicture: 'data:image/png;base64,' + base64Image });
							  await refreshUserTotals();

						} catch (error) {
							console.error('Erro ao converter a imagem para base64:', error);
						}

						setLoading(false);
					}
				}
			});

		} catch (error) {
			console.error('Erro ao atualizar a imagem do perfil:', error);
			setLoading(false);
			Alert.alert('Erro', 'Erro ao atualizar a imagem do perfil. Por favor, tente novamente mais tarde.');
		}
	};

	const convertImageToBase64 = async (uri: string) => {
		return new Promise<string>((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', uri);
			xhr.responseType = 'blob';
			xhr.onerror = () => reject('Erro ao carregar a imagem');
			xhr.onload = () => {
				const blob = xhr.response;
				const reader = new FileReader();
				reader.onload = () => {
					const base64 = reader.result as string;
					resolve(base64.replace(/^data:image\/[a-z]+;base64,/, ''));
				};
				reader.onerror = () => reject('Erro ao ler a imagem');
				reader.readAsDataURL(blob);
			};
			xhr.send();
		});
	};

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
			{/* <TouchableOpacity onPress={handleEditPress} disabled={loading}>
				<Image
					source={require('../assets/images/edit-img-button.png')}
					style={styles.editButton}
				/>
			</TouchableOpacity> */}
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

export default ProfileImage;

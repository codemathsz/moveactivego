import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { getUser, updateProfilePicture } from '../apis/user.api';
import { AuthProvider, useAuth, } from '../contexts/AuthContext';

const ProfileImage = ({ size = 64, style }: any) => {
	const { user, jwt } = useAuth();
	const auth = useAuth();
	const [loading, setLoading] = useState(false);
	const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");

	const fetchUserInfo = async () => {
		try {
			if (jwt) {
				const userInfo = await getUser(jwt);
				setProfilePicture(userInfo.profilePicture);
				
				auth.updateProfile(jwt);
				
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
							await fetchUserInfo();

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
				<Image source={{ uri: profilePicture }} style={[styles.profileImage, style, { width: size, height: size, borderRadius: size / 2 }]} />
			) : (
				<Image source={require('../assets/images/avatar-placeholder.png')} style={[styles.profileImage, style, { width: size, height: size, borderRadius: size / 2 }]} />
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

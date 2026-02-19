import React, { useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { colors } from '../../constants/Screen';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useToast } from '../../contexts/ToastContext';
import { userUpdateInfo, updateProfilePicture } from '../../apis/user.api';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/customButton';

const SettingsScreen = () => {
    const navigation = useNavigation<any>();
    const { jwt, user, updateProfile } = useAuth();
    const { userInfo, refreshUserInfo } = useProfile();
    const { showWarning } = useToast();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [loading, setLoading] = useState(false);

    // Valores iniciais para comparação
    const [initialValues, setInitialValues] = useState({
        name: '',
        email: '',
        phone: '',
        birthdate: '',
    });

    useEffect(() => {
        // Usa userInfo se disponível, senão usa user do AuthContext
        const userData = userInfo?.user || user;

        if (userData) {
            console.log('Dados do usuário carregados:', userData);

            const formattedPhone = userData.phone ? formatPhone(userData.phone) : '';
            const formattedBirthdate = userData.birthdate ? formatDate(userData.birthdate) : '';

            const initialData = {
                name: userData.name || '',
                email: userData.recoveryEmail || userData.email || '',
                phone: formattedPhone,
                birthdate: formattedBirthdate,
            };

            setName(initialData.name);
            setEmail(initialData.email);
            setPhone(initialData.phone);
            setBirthdate(initialData.birthdate);
            setInitialValues(initialData);
            setProfilePicture(userData.profilePicture || null);
        }
    }, [userInfo, user]);

    // Verifica se há mudanças
    useEffect(() => {
        const changed =
            name !== initialValues.name ||
            email !== initialValues.email ||
            phone !== initialValues.phone ||
            birthdate !== initialValues.birthdate;

        setHasChanges(changed);
    }, [name, email, phone, birthdate, initialValues]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateForAPI = (dateString: string) => {
        if (!dateString) return '';
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    };

    const formatPhone = (phoneString: string) => {
        if (!phoneString) return '';
        // Remove tudo que não é número
        let cleaned = phoneString.replace(/\D/g, '');

        // Se tiver código do país (55), remove
        if (cleaned.startsWith('55')) {
            cleaned = cleaned.substring(2);
        }

        // Aplica máscara +55 00 0000-0000 ou +55 00 00000-0000
        if (cleaned.length >= 2) {
            const ddd = cleaned.substring(0, 2);
            const resto = cleaned.substring(2);

            if (resto.length > 4) {
                const parte1 = resto.substring(0, resto.length - 4);
                const parte2 = resto.substring(resto.length - 4);
                return `+55 ${ddd} ${parte1}-${parte2}`;
            } else {
                return `+55 ${ddd} ${resto}`;
            }
        }

        return cleaned ? `+55 ${cleaned}` : '';
    };

    const handlePhoneChange = (text: string) => {
        // Remove tudo que não é número
        let cleaned = text.replace(/\D/g, '');

        // Se começar com 55, remove (código do país)
        if (cleaned.startsWith('55') && cleaned.length > 2) {
            cleaned = cleaned.substring(2);
        }

        // Limita a 11 dígitos (DDD + número)
        cleaned = cleaned.substring(0, 11);

        // Aplica máscara +55 DD NNNNN-NNNN ou +55 DD NNNN-NNNN
        let formatted = '';
        if (cleaned.length > 0) {
            formatted = '+55';
            if (cleaned.length >= 1) {
                formatted += ' ' + cleaned.substring(0, 2);
            }
            if (cleaned.length >= 3) {
                const localPart = cleaned.substring(2);
                if (localPart.length <= 4) {
                    formatted += ' ' + localPart;
                } else {
                    // Decide se é 9 dígitos (celular) ou 8 (fixo)
                    const splitPos = localPart.length - 4;
                    formatted += ' ' + localPart.substring(0, splitPos) + '-' + localPart.substring(splitPos);
                }
            }
        }

        setPhone(formatted);
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

    const handlePickImage = async () => {
        try {
            await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 1,
            }, async (response) => {
                if (!response.didCancel && !response.errorCode) {
                    const uri = response?.assets?.[0]?.uri;

                    if (uri && jwt && user?.id) {
                        try {
                            setLoading(true);
                            const base64Image = await convertImageToBase64(uri);

                            await updateProfilePicture(jwt, {
                                userId: user.id,
                                profilePicture: 'data:image/png;base64,' + base64Image,
                            });

                            await updateProfile(jwt);
                            await refreshUserInfo();

                            setProfilePicture('data:image/png;base64,' + base64Image);
                            Alert.alert('Sucesso', 'Foto de perfil atualizada!');
                        } catch (error) {
                            console.error('Erro ao atualizar foto:', error);
                            Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        }
    };

    const handleSave = async () => {
        showWarning('API em manutenção');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="close" size={24} color="#373743" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configurações</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Foto de Perfil */}
                    <View style={styles.profileSection}>
                        <View style={styles.profileImageContainer}>
                            {profilePicture ? (
                                <Image source={{ uri: profilePicture }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.profileImagePlaceholder}>
                                    <Ionicons name="person" size={48} color="#898996" />
                                </View>
                            )}
                        </View>
                        <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
                            <Ionicons name="camera" size={20} color="#373743" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.profileLabel}>Alterar foto do perfil</Text>

                    {/* Campos de Informação */}
                    <View style={styles.form}>
                        <CustomInput
                            label="Nome"
                            placeholder="Seu nome"
                            value={name}
                            onChange={setName}
                        />

                        <CustomInput
                            label="Email"
                            placeholder="email@gmail.com"
                            value={email}
                            onChange={setEmail}
                            propsInput={{
                                keyboardType: 'email-address',
                                autoCapitalize: 'none',
                            }}
                        />

                        <CustomInput
                            label="Celular"
                            placeholder="+55 00 0000-0000"
                            value={phone}
                            onChange={handlePhoneChange}
                            propsInput={{
                                keyboardType: 'phone-pad',
                            }}
                        />

                        <CustomInput
                            label="Data de Nascimento"
                            placeholder="00/00/0000"
                            value={birthdate}
                            onChange={setBirthdate}
                            mask={true}
                        />
                    </View>

                    {/* Botão Salvar */}
                    <View style={styles.buttonContainer}>
                        <CustomButton
                            title="Salvar"
                            onPress={handleSave}
                            type={hasChanges ? 'primary' : 'gray'}
                            loading={loading}
                            gradient={hasChanges}
                            style={styles.saveButton}
                        />
                    </View>

                    {/* Seção Segurança */}
                    <View style={styles.securitySection}>
                        <Text style={styles.sectionTitle}>Segurança</Text>

                        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePassword')}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#373743" />
                                </View>
                                <Text style={styles.menuItemText}>Senha</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#898996" />
                        </TouchableOpacity>

                        <View style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="shield-checkmark-outline" size={20} color="#373743" />
                                </View>
                                <Text style={styles.menuItemText}>Privacidade</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#898996" />
                        </View>

                        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('DeleteAccount')}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="trash-outline" size={20} color="#373743" />
                                </View>
                                <Text style={styles.menuItemText}>Excluir minha conta</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#898996" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.background,
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: '#040415',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
        position: 'relative',
    },
    profileImageContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    profileImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraButton: {
        position: 'absolute',
        right: '35%',
        bottom: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E6E6E8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileLabel: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        color: '#040415',
        textAlign: 'center',
        marginBottom: 24,
    },
    form: {
        gap: 16,
        paddingHorizontal: 4,
    },
    buttonContainer: {
        marginTop: 24,
        paddingHorizontal: 4,
    },
    saveButton: {
        width: '100%',
    },
    securitySection: {
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
        color: '#373743',
        marginBottom: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E6E6E8',
        padding: 16,
        marginBottom: 8,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ECF8ED',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemText: {
        fontSize: 15,
        fontFamily: 'Inter-SemiBold',
        color: '#040415',
    },
});

export default SettingsScreen;

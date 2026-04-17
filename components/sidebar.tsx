import React, { useState } from "react";
import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import IconFeather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { colors } from "../constants/Screen";
import SideProfileImage from "./sideProfileImage";
import { useNavigation } from "@react-navigation/native";
import { deleteAllRuns } from "../apis/user.api";

const Sidebar = ({ navigation }: any) => {
  const closeDrawer = () => navigation.closeDrawer();
  const { user } = useAuth();
  return (
    <LinearGradient colors={["#0BB974", "#038D78"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.root}>
      <TouchableOpacity style={{ marginBottom: 20 }}
        onPress={() => navigation.closeDrawer()}
      >
        <IconFeather
          name={'menu'}
          size={24}
          color={colors.background}
        />
      </TouchableOpacity>
      <Header />
      <Separator />

      <MenuItem icon='home-outline' title='Home' screen='Dashboard' closeDrawer={closeDrawer} />
      <MenuItem icon='person-outline' title='Perfil' screen='Profile' closeDrawer={closeDrawer} />
      <MenuItem icon='trophy-outline' title='Leaderboard' screen='Leaderboard' closeDrawer={closeDrawer} />

      <View style={styles.flexFill}></View>
      {user?.is_admin && <AdminSection closeDrawer={closeDrawer} />}
      <Footer />
    </LinearGradient>
  );
};

const Header = () => {
  const { profile, userInfo } = useProfile();
  const { user, userTotals } = useAuth();
  const name = userTotals?.name || user?.name || profile.name;

  return (
    <View style={styles.headerContainer}>
      <SideProfileImage size={48} style={{ marginRight: 16 }} />
      <View style={styles.userInfoContainer}>
        <Text style={styles.username}>{name}</Text>
        <Text style={styles.level}>Level {userInfo?.level ?? profile.level}</Text>
      </View>
    </View>
  );
};

const Separator = () => {
  return <View style={styles.separator} />;
};

interface MenuItemProps {
  icon: any;
  title: string;
  screen: string;
}

const MenuItem = ({ icon, title, screen, closeDrawer }: MenuItemProps & { closeDrawer: () => void }) => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        navigation.navigate(screen);
        closeDrawer();
      }}
    >
      <Ionicons name={icon} size={16} color='#FEFEFE' />
      <Text style={styles.menuItemText}>{title}</Text>
    </TouchableOpacity>
  );
};

const AdminSection = ({ closeDrawer }: { closeDrawer: () => void }) => {
  const { jwt, refreshUserTotals } = useAuth();
  const { refreshUserInfo } = useProfile();
  const [loading, setLoading] = useState(false);

  const handleDeleteRuns = () => {
    Alert.alert(
      'Limpar todas as corridas',
      'Tem certeza? Esta ação é irreversível e irá apagar TODAS as corridas de TODOS os usuários.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, limpar tudo',
          style: 'destructive',
          onPress: () => confirmDelete(),
        },
      ]
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Confirmação final',
      'Digite "CONFIRMAR" mentalmente e pressione OK para continuar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'OK, apagar agora',
          style: 'destructive',
          onPress: async () => {
            if (!jwt) return;
            setLoading(true);
            closeDrawer();
            try {
              await deleteAllRuns(jwt);
              await Promise.all([refreshUserTotals(), refreshUserInfo()]);
              Alert.alert('Concluído', 'Todas as corridas foram apagadas.');
            } catch (e: any) {
              Alert.alert('Erro', e?.message || 'Não foi possível apagar as corridas.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <View style={styles.adminSeparator} />
      <TouchableOpacity
        style={[styles.menuItem, styles.adminItem, loading && { opacity: 0.5 }]}
        onPress={handleDeleteRuns}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Ionicons name='trash-outline' size={16} color='#FF6B6B' />
        <Text style={[styles.menuItemText, styles.adminItemText]}>
          {loading ? 'Apagando...' : 'Limpar corridas'}
        </Text>
      </TouchableOpacity>
    </>
  );
};

const Footer = () => {
  const auth = useAuth();

  const handleOpenAppInStore = () => {
    const ANDROID_PACKAGE_NAME = 'com.MoveActiveGo';
    const TESTFLIGHT_URL = 'https://testflight.apple.com/join/ABC123XYZ';
    const url = Platform.select({
      android: `market://details?id=${ANDROID_PACKAGE_NAME}`,
      ios: TESTFLIGHT_URL,
    });
    if (url) {
      Linking.openURL(url).catch((err) => {
        console.error('Erro ao abrir a loja:', err);
      });
    }
  };

  return (
    <View style={[styles.footerContainer]}>
      <TouchableOpacity style={styles.menuItem} onPress={() => auth.logout()}>
        <Ionicons name='exit-outline' size={24} color='#FEFEFE' />
        <Text style={[styles.menuItemText]}>Sair</Text>
      </TouchableOpacity>
      <Text onPress={() => handleOpenAppInStore()} style={{fontSize: 16, textDecorationLine: 'underline', color: '#FFF'}}>{auth.appVersion}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.primary,
    flex: 1,
    padding: 16,
    paddingTop: 48,
    gap: 16,
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: colors.primary,
  },
  headerContainer: {
    flexDirection: "row",
  },
  userInfoContainer: {
    justifyContent: "center",
  },
  username: {
    color: "#FEFEFE",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    lineHeight: 19.88,
    letterSpacing: 0.235,
  },
  level: {
    color: "#FEFEFE",
    fontFamily: "Poppins-Bold",
    fontSize: 12,
    lineHeight: 15.6,
    letterSpacing: 0.323,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuItemText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.269,
    color: "#FEFEFE",
  },
  footerContainer: {
    display: "flex",
    flexDirection: 'column',
    gap: 16,
    marginBottom: 64,
  },
  flexFill: {
    flex: 1,
  },
  adminSeparator: {
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  adminItem: {
    marginTop: 4,
  },
  adminItemText: {
    color: '#FF6B6B',
  },
});

export default Sidebar;

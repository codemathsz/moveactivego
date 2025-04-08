import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import IconFeather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getUser } from "../apis/user.api";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { colors } from "../constants/Screen";
import SideProfileImage from "./sideProfileImage";
import { useRouter } from "expo-router";

const Sidebar = ({ navigation }: any) => {
  const closeDrawer = () => navigation.closeDrawer();
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

      <MenuItem icon='home-outline' title='Home' screen='/dashboard' closeDrawer={closeDrawer} />
      {/* <MenuItem icon='person-outline' title='Perfil' screen='/profile' closeDrawer={closeDrawer} /> */}
      {/* <MenuItem icon='wallet-outline' title='Carteira' screen='Carteira' closeDrawer={closeDrawer} />
      <MenuItem icon='cart-outline' title='Marketplace' screen='Marketplace' closeDrawer={closeDrawer} /> */}
      {/* <MenuItem icon='cart-outline' title='Carrinho' /> */}
    {/*   <MenuItem icon='notifications-outline' title='Notificações' screen='Notificações' closeDrawer={closeDrawer} />
      <MenuItem icon='settings-outline' title='Configurações' screen='Configurações' closeDrawer={closeDrawer} /> */}
      {/* <MenuItem icon='bug-outline' title='Bug Report' />
      <MenuItem icon='' title='View Run' screen='ViewRun' /> */}

      <View style={styles.flexFill}></View>
      <Footer />
    </LinearGradient>
  );
};

const Header = () => {
  const { profile, userInfo } = useProfile();
  const { user, jwt } = useAuth();
  const [name, setName] = useState<string>(user?.name || profile.name);

  const fetchUserInfo = async () => {
    try {
      if (jwt) {
        const userInfo = await getUser(jwt);

        setName(userInfo.name);
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
  const route = useRouter()
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        route.push(screen as any)
        closeDrawer();
      }}
    >
      <Ionicons name={icon} size={16} color='#FEFEFE' />
      <Text style={styles.menuItemText}>{title}</Text>
    </TouchableOpacity>
  );
};

const Footer = () => {
  const auth = useAuth();
  return (
    <TouchableOpacity style={[styles.footerContainer, styles.menuItem]} onPress={() => auth.logout()}>
      <Ionicons name='exit-outline' size={24} color='#FEFEFE' />
      <Text style={[styles.menuItemText]}>Sair</Text>
    </TouchableOpacity>
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
    marginBottom: 64,
  },
  flexFill: {
    flex: 1,
  },
});

export default Sidebar;

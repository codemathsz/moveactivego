// TopBar.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import IconFeather from '@expo/vector-icons/Feather';
import { getUnreadNotifications, getUser, markReadNotifications } from '../apis/user.api';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { colors } from '../constants/Screen';

const TopBar = ({ navigation }: any) => {
  const { user, jwt } = useAuth();
  const { profile } = useProfile();
  const [name, setName] = useState<string>('Teste');
  const [not, setNot] = useState<number>(0);

  const fetchUserInfo = async () => {
    try {
      if (jwt) {
        const userInfo = await getUser(jwt);
        setName(userInfo.name);

        /* const notification = await getUnreadNotifications(jwt);
        setNot(notification.length) */

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

  const updateNot = async () => {
    if (jwt) {
      const updateNote = await markReadNotifications(jwt);
      setNot(0)
    } else {
      console.error("Token JWT é nulo.");
    }
  }



  return (
    <View style={styles.container}>

      <View style={styles.leftContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <IconFeather
            name={'menu'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Text>
          <Text style={styles.title}>Olá, </Text>
          <Text style={styles.name}>{name}</Text>
        </Text>
      </View>

      {/* <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => { navigation.navigate('Notificações'), updateNot() }}
      >
        <Ionicons name="notifications-outline" size={24} color={colors.primary} />
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>{not}</Text>
        </View>
      </TouchableOpacity> */}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
  },
  menuButton: {
    marginRight: 16,
  },
  leftContainer: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#4c4c4c',
  },
  name: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#4c4c4c',
  },
  notificationButton: {
    // Add styles if needed
  },
  notificationBadge: {
    backgroundColor: '#ff3355',
    position: 'absolute',
    right: -6,
    top: -3,
    borderRadius: 16,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  }
});

export default TopBar;

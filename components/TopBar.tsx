// TopBar.js
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { markReadNotifications } from '../apis/user.api';
import { useAuth } from '../contexts/AuthContext';
import ProfileImage from './profileImage';

const TopBar = ({ navigation }: any) => {
  const { user, jwt, userTotals } = useAuth();
  const [not, setNot] = useState<number>(0);

  const name = userTotals?.name || user?.name || 'Corredor';

  const getFormattedDate = () => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const now = new Date();
    const dayName = days[now.getDay()];
    const day = String(now.getDate()).padStart(2, '0');
    const month = months[now.getMonth()];
    
    return `${dayName}, ${day} ${month}`;
  };

  const currentDate = useMemo(() => getFormattedDate(), []);

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
        <ProfileImage size={56} style={{ marginRight: 12 }} />
        
        <View>
          <Text style={styles.greeting}>Olá {name}</Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => { /* navigation.navigate('Notificações'), updateNot() */ }}
      >
        <Ionicons name="notifications-outline" size={28} color="#4c4c4c" />
        {not > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>{not}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#898996',
    fontWeight: '400',
  },
  date: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#373743',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    backgroundColor: '#ff3355',
    position: 'absolute',
    right: 6,
    top: 6,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  }
});

export default TopBar;

import { useNavigation } from '@react-navigation/native';
import React, { Suspense, useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../constants/Screen';
import { getUser, getUserTotalInfo } from '../../apis/user.api';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import ProfileImage from '@/components/profileImage';
import PersonalStat from '@/components/PersonalStat';
import NavigationBar from '@/components/navigationBar';


const Badge = () => (
  <LinearGradient
    colors={['#0BB974', '#038D78']}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={styles.badge}
  />
);

const ProfileScreen = () => {
  const { profile } = useProfile();
  const { user, jwt } = useAuth();
  const { userInfo } = useProfile();
  const navigation = useNavigation<any>();
  const [name, setName] = useState(user?.name ?? profile.name);
  const [userTotalDuration, setUserTotalDuration] = useState();
  const [userTotalCalories, setUserTotalCalories] = useState();
  const [userTotalDistance, setUserTotalDistance] = useState<number>();
  const [userTotalRuns, setUserTotalRuns] = useState();

  const fetchUserInfo = async () => {
    try {
      if (jwt) {
        const userInfo = await getUser(jwt);
        setName(userInfo.name);
        setUserTotalCalories(userInfo?.total_calories);
        setUserTotalDistance(userInfo?.total_distance);
        setUserTotalDuration(userInfo?.total_duration);
        setUserTotalRuns(userInfo?.total_runs);
      } else {
        console.error("Token JWT é nulo.");
      }
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
    }
  };

  const convertTime = (time: number = 0) => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours}:${minutes}`;

  }

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }}>
          <View style={styles.root}>
            <ProfileImage size={96} style={{}} />
            <Text style={styles.nameText}>{name}</Text>
            <Text style={styles.levelText}>Level {userInfo?.level ?? profile.level}</Text>
            {/* 
            <View style={styles.badgeContainer}>
              <Badge />
              <Badge />
              <Badge />
              <Badge />
            </View> */}

            <View style={styles.personalStatContainer}>
              <PersonalStat
                icon={require('../../assets/icons/total-time-icon.png')}
                value={convertTime(userTotalDuration ?? 0)}
                color="#FC457B"
                description={'Horas'}
              />
              <PersonalStat
                icon={require('../../assets/icons/total-distance-icon.png')}
                value={String(userTotalDistance?.toFixed(2) ?? 0)}
                color="#FFB905"
                description={'Quilômetros'}
              />
              <PersonalStat
                icon={require('../../assets/icons/total-calories-icon.png')}
                value={String(userTotalCalories ?? 0)}
                color="#248E00"
                description={'Calorias'}
              />
              <PersonalStat
                icon={require('../../assets/icons/total-runs-icon.png')}
                value={String(userTotalRuns ?? 0)}
                color="#006FDD"
                description={'Corridas'}
              />
            </View>

            <View style={styles.profileButtonsContainer}>
              {/* <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Friends')}>
                <Image source={require('../../assets/images/soquinho.png')} resizeMode="contain" />
                <Text style={styles.buttonText}>Amigos</Text>
              </TouchableOpacity> */}
              <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Activities')}>
                <Image source={require('../../assets/images/atividade.png')} resizeMode="contain" />
                <Text style={styles.buttonText}>Atividade</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Scoreboard')}>
                <Image source={require('../../assets/images/placar.png')} resizeMode="contain" />
                <Text style={styles.buttonText}>Placar</Text>
              </TouchableOpacity> */}
              {/* <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Achievments')}>
                <Image source={require('../../assets/images/conquista.png')} resizeMode="contain" />
                <Text style={styles.buttonText}>Conquistas</Text>
              </TouchableOpacity> */}
            </View>
            <View style={styles.profileButtonsContainer}>
              {/* <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Goals')}>
                <Image source={require('../../assets/images/objetivo.png')} resizeMode="contain" />
                <Text style={styles.buttonText}>Objetivos</Text>
              </TouchableOpacity>
              <View style={{ width: '27.5%' }}></View> */}
            </View>
          </View>
      </ScrollView>
      <View style={styles.navigationBar}>
        <NavigationBar />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colors.background,
    paddingVertical: 16,
    paddingBottom: 90
  },
  nameText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    color: colors.textPrimary,
    marginTop: 14
  },
  levelText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    color: colors.textPrimary,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 48,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 16,
  },
  personalStatContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 32,
    marginVertical: 16,
  },
  profileButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  profileButton: {
    width: '27.5%',
    height: 126,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textPrimary,
    letterSpacing: 0.3,
    marginTop: 8,
  },
  navigationBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default ProfileScreen;
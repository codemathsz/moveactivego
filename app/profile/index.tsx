import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../constants/Screen';
import { getUser } from '../../apis/user.api';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import ProfileImage from '@/components/profileImage';
import NavigationBar from '@/components/navigationBar';

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
      {/* Header Personalizado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Image 
            source={require('@/assets/icons/arrow-right.png')} 
            style={styles.backIcon} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="settings-outline" size={20} color="#373743" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.root}>
            {/* Foto de Perfil */}
            <ProfileImage size={112} style={{ marginTop: 8 }} />
            
            {/* Nome */}
            <Text style={styles.nameText}>{name}</Text>
            
            {/* Level com ícone */}
            <View style={styles.levelContainer}>
              <Image 
                source={require('@/assets/icons/award.png')}
                style={{ width: 16, height: 20 }} 
              />
              <Text style={styles.levelText}>Level {userInfo?.level ?? profile.level}</Text>
            </View>

            {/* Grid de Estatísticas 2x2 */}
            <View style={styles.statsGrid}>
              {/* Linha 1 */}
              <View style={styles.statsRow}>
                {/* Calorias */}
                <View style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statLabel}>Calorias</Text>
                    <View style={styles.iconContainer}>
                      <Image 
                        source={require('../../assets/images/fire.png')} 
                        style={{ width: 24, height: 24 }} 
                      />
                    </View>
                  </View>
                  <Text style={styles.statValue}>
                    {Number(userTotalCalories ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </Text>
                  <Text style={styles.statUnit}>kcal</Text>
                </View>

                {/* Quilômetros */}
                <View style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statLabel}>Quilômetros</Text>
                    <View style={styles.iconContainer}>
                      <Image 
                        source={require('@/assets/images/shoe-run.png')}
                        style={{ width: 24, height: 24 }} 
                      />
                    </View>
                  </View>
                  <Text style={styles.statValue}>
                    {Number(userTotalDistance ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.statUnit}>km</Text>
                </View>
              </View>

              {/* Linha 2 */}
              <View style={styles.statsRow}>
                {/* Corridas */}
                <View style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statLabel}>Corridas</Text>
                    <View style={styles.iconContainer}>
                      <Image 
                        source={require('../../assets/images/steps.png')} 
                        style={{ width: 24, height: 24 }} 
                      />
                    </View>
                  </View>
                  <Text style={styles.statValue}>{userTotalRuns ?? 0}</Text>
                  <Text style={styles.statUnit}>Total</Text>
                </View>

                {/* Horas */}
                <View style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statLabel}>Horas</Text>
                    <View style={styles.iconContainer}>
                      <Image 
                        source={require('../../assets/icons/time-gray.png')} 
                        style={{ width: 24, height: 24 }} 
                      />
                    </View>
                  </View>
                  <Text style={styles.statValue}>{convertTime(userTotalDuration ?? 0)}</Text>
                  <Text style={styles.statUnit}>Percorridas</Text>
                </View>
              </View>
            </View>

            {/* Seção Suas Conquistas */}
            <View style={styles.achievementsSection}>
              <View style={styles.achievementsHeader}>
                <Text style={styles.achievementsTitle}>Suas conquistas</Text>
                <TouchableOpacity>
                  <Text style={styles.seeMoreText}>Ver mais ›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.achievementsGrid}>
                {[
                  { id: 1, icon: require('../../assets/icons/special.png') },
                  { id: 2, icon: require('../../assets/icons/beach-ready.png') },
                  { id: 3, icon: require('../../assets/icons/full-body.png') },
                  { id: 4, icon: require('../../assets/icons/challenge.png') }
                ].map((item) => (
                  <View key={item.id} style={styles.achievementItem}>
                    <View style={styles.achievementIcon}>
                      <Image 
                        source={item.icon} 
                        style={{ width: 48, height: 48 }} 
                      />
                    </View>
                    <Text style={styles.achievementLabel}>Conquista {item.id}</Text>
                  </View>
                ))}
              </View>
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
  backIcon: {
    width: 20,
    height: 20,
    transform: [{ rotate: '180deg' }],
    tintColor: '#000000',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#040415',
  },
  root: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  nameText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    color: '#040415',
    marginTop: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  levelText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  statsGrid: {
    width: '100%',
    marginTop: 24,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6E6E8',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#373743',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#373743',
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#898996',
  },
  achievementsSection: {
    width: '100%',
    marginTop: 32,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#373743',
  },
  seeMoreText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#7C7D82',
  },
  achievementsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  achievementItem: {
    flex: 1,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#ECF8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#373743',
    textAlign: 'center',
  },
  navigationBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default ProfileScreen;
import NavigationBar from "@/components/navigationBar";
import StatsBar from "@/components/StatsBar";
import TopBar from "@/components/TopBar";
import DailyMissionCard from "@/components/DailyMissionCard";
import ActivityModeSelector from "@/components/ActivityModeSelector";
import CustomButton from "@/components/customButton";
import { colors } from "@/constants/Screen";
import { StyleSheet, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapArea from "@/components/mapArea";
import { useNavigation } from "@react-navigation/native";
import { useRun } from "@/contexts/RunContext";

const DashboardScreen = () =>{
  const navigation = useNavigation<any>();
  const { isRunning } = useRun();

  const handleStartRun = () => {
    // Se já estiver correndo, navegar para a tela de corrida
    if (isRunning) {
      navigation.navigate('Run');
      return;
    }
    // Se não estiver correndo, a MapArea irá iniciar a corrida
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopBar navigation={navigation}/>

      <View style={styles.statsBar}>
        <StatsBar />
      </View>

      <View style={styles.missionCard}>
        <DailyMissionCard />
      </View>

      <View style={styles.activitySelector}>
        <ActivityModeSelector />
      </View>

      <View style={styles.mapContainer}>
        <MapArea start={false} dashboard={true} skill={undefined} />
      </View>

      <View style={styles.navigationBar}>
        <NavigationBar />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsBar: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  missionCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  activitySelector: {
    marginTop: 8,
  },
  mapContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 80,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  navigationBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default DashboardScreen;
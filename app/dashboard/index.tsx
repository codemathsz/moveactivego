import NavigationBar from "@/components/navigationBar";
import StatsBar from "@/components/StatsBar";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Screen";
import { useEffect, useState } from "react";
import { AppRegistry, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapArea from "@/components/mapArea";
import { useNavigation } from "@react-navigation/native";
interface ILocation{
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  mocked?: boolean
  timestamp: number;
}

const DashboardScreen = () =>{
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <TopBar navigation={navigation}/>

      <View style={styles.statsBar}>
        <StatsBar />
      </View>
  
      <View style={{ display: 'flex', alignItems: 'flex-end', paddingHorizontal: 16, marginTop: 2 }}>
  {/*       <TouchableOpacity>
          <AntDesign name={showCards ? 'up' : 'down'} size={26} color="#4c4c4c" />
        </TouchableOpacity> */}
      </View>


      <View style={[styles.mapContainer, { paddingTop: 5 }]}>
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
    marginTop: 16
  },
  cardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 0,
  },
  skillCardStack: {
    marginRight: 16,
    gap: 16,
  },
  shoeCardContainer: {
    flex: 1
  },
  mapContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  navigationBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 22,
    paddingVertical: 60,
  },
  modalContent: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#424242',
  },
  productsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    flexWrap: "wrap",
    width: "40%"
  },
  productsCard1: {
    width: 150,
    margin: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productsCardContent: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    paddingBottom: 4
  },
  productDetails: {
    fontFamily: "Poppins-Regular",
    fontWeight: "800",
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  productName: {
    fontFamily: "Poppins-Regular",
    fontWeight: "700",
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
    textAlign: "left",
    color: "#212121",
    width: "100%",
  },
  productID: {
    fontFamily: "Poppins-Regular",
    fontWeight: "500",
    fontSize: 8,
    lineHeight: 12,
    letterSpacing: 0.3,
    textAlign: "left",
    color: "#9E9D9D",
    width: "100%",
  },
  modalTitle: {
    color: '#4C4C4C',
    fontFamily: 'Poppins-Bold',
    fontSize: 21,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 19.88,
    letterSpacing: 0.07,
    paddingTop: 16
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
});

export default DashboardScreen;
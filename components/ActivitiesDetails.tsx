import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const ActivitiesDetails = ({ date, time, local, calories, distance }: any) => {

  //const icon = type === "sent" ? require('../assets/icons/wallet-transfer-icon.png') : require('../assets/icons/wallet-receive-icon.png');

  const date1 = new Date(date);
  //<Image source={'../../assets/icons/total-time-icon.png'} style={{ width: 16, height: 16 }} />
  return (
    <View style={styles.container}>
      <View style={styles.startColumn}>
        <Text style={styles.value}>
          {date1 ? new Intl.DateTimeFormat('pt-BR', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
          }).format(date1) : "Data inválida"}
        </Text>

        <Text style={styles.value}>{time}</Text>
      </View>
      <View style={styles.column}>
        <View style={styles.displayGrid}>
          <Image source={require('../assets/icons/total-distance-icon.png')} style={{ width: 16, height: 16, marginRight: 6 }} />
          <Text style={styles.value}>{local}</Text>
        </View>
      </View>
      <View style={styles.column}>
        <View style={styles.displayGrid}>
          <Image source={require('../assets/icons/total-calories-icon.png')} style={{ width: 16, height: 16, marginRight: 6 }} />
          <Text style={styles.value}>{Number(calories).toFixed(2) ?? 0}</Text>
        </View>
      </View>
      <View style={styles.column}>
        <View style={[styles.displayGrid, {paddingLeft: 20}]}>
          <Image source={require('../assets/icons/total-runs-icon.png')} style={{ width: 16, height: 16, marginRight: 6 }} />
          <Text style={styles.value}>{distance ?? 0}Km</Text>
        </View>
      </View>
      <View style={styles.endColumn}>
        <View style={styles.displayGrid}>
          <Image source={require('../assets/icons/arrow-right.png')} style={{ width: 18, height: 18, }} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  
  container: {
    flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  column: {
    flex: 1,
    fontSize: 12,
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center'
  },
  startColumn: {
		flex: 1,
	},
  endColumn: {
    width: 50,
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'flex-end'
  },
  label: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#757575',
  },
  value: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#416162',
  },
  displayGrid: {
    display: 'flex', flexDirection: 'row', alignItems: 'center'
  }
});

export default ActivitiesDetails;

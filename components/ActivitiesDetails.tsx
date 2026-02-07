import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const ActivitiesDetails = ({ date, time, local, calories, distance }: any) => {

  const date1 = new Date(date);
  
  // Formata a data no formato: "02 de dez. de 2025"
  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return "Data inválida";
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date).replace('.', '');
  };

  return (
    <View style={styles.container}>
      {/* Data no topo */}
      <Text style={styles.dateText}>{formatDate(date1)}</Text>
      
      {/* Conteúdo principal */}
      <View style={styles.contentRow}>
        {/* Ícone em box verde à esquerda */}
        <View style={styles.iconBox}>
          <Image 
            source={require('../assets/icons/running.png')} 
            style={styles.runIcon} 
          />
        </View>
        
        {/* Informações da corrida */}
        <View style={styles.infoContainer}>
          {/* Primeira linha: Corrida e Km */}
          <View style={styles.firstLine}>
            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2}}>
              <Image source={require('../assets/icons/shoe-run-gray.png')} style={{width:20, height:20}} />
              <Text style={styles.activityType}>Corrida</Text>
            </View>
            <Text style={styles.distanceText}>{distance ?? 0} km</Text>
          </View>
          
          {/* Segunda linha: duração, calorias e local */}
          <View style={styles.secondLine}>
            <View style={styles.infoItem}>
              <Image 
                source={require('../assets/icons/time-gray.png')} 
                style={styles.smallIcon} 
              />
              <Text style={styles.infoText}>{time}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Image 
                source={require('../assets/icons/fire-gray.png')} 
                style={styles.smallIcon} 
              />
              <Text style={styles.infoText}>{Number(calories).toFixed(2)}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Image 
                source={require('../assets/icons/location-gray.png')} 
                style={styles.smallIcon} 
              />
              <Text style={styles.infoText}>{local || 'Sem localização'}</Text>
            </View>
          </View>
        </View>
        
        {/* Seta à direita */}
        <Image 
          source={require('../assets/icons/arrow-right.png')} 
          style={styles.arrowIcon} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 45,
    height: 45,
    backgroundColor: '#ECF8ED',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  runIcon: {
    width: 20,
    height: 20,
  },
  infoContainer: {
    flex: 1,
  },
  firstLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityType: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginRight: 8,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  secondLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIcon: {
    width: 16,
    height: 16,
    marginRight: 3,
  },
  infoText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  arrowIcon: {
    width: 18,
    height: 18,
    tintColor: '#757575',
    marginLeft: 8,
  },
});

export default ActivitiesDetails;

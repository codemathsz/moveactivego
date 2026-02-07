import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';

import { colors } from "@/constants/Screen";
import * as commonStyles from '../../constants/common';
import { getRun } from '../../apis/user.api';
import { useAuth } from '../../contexts/AuthContext';
import NavigationBar from '@/components/navigationBar';
import ActivitiesDetails from '@/components/ActivitiesDetails';
import { ScrollView } from 'react-native-gesture-handler';


const ActivitiesScreen = () => {
	const navigation = useNavigation<any>();
	const { user, jwt } = useAuth();
	const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		getRunList()
	}, []);

	const getRunList = async () => {
		try {
			if (jwt) {
                setLoading(true)
				const data = await getRun(jwt);

				setActivities(data.runs)
				setLoading(false)
			} else {
				console.error("Token JWT é nulo.");
			}
		} catch (error) {
			console.error("Erro ao buscar Atividades:", error);
		}
	};

	const handlePress = (activitie: any) => {
		navigation.navigate('freeRun', { 
            card: true, 
            start: false, 
            initialLocation: activitie.local, 
            max_speed: activitie.max_speed, 
            min_speed: activitie.min_speed, 
            avg_speed: activitie.avg_speed, 
            duration: activitie.duration, 
            calories: activitie.calories, 
            distance: activitie.distance, 
            allRoutes: activitie.routes ,
            firstRouteCoordinates: activitie.routes[0], 
            lastRouteCoordinates: activitie.routes[activitie.routes?.length - 1], 
        });
	};

	return (
		<View style={styles.root}>
			<Text style={styles.title}>Atividades Recentes</Text>
			
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {
                loading ?  (
                    <ActivityIndicator size="large" color={ styles.primaryText.color} style={{marginTop: 21}} />
                ) : (
                    <View style={styles.activitiesContainer}>
                        {activities.map((activitie, index) => (
                            <TouchableOpacity key={index} onPress={() => {
                                handlePress(activitie)
                            }}>
                                <ActivitiesDetails
                                    date={activitie.created_at}
                                    time={activitie.duration}
                                    local={activitie.city}
                                    calories={activitie.calories}
                                    distance={activitie.distance}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                )
                }
            </ScrollView>

			<View style={styles.navigationBar}>
				<NavigationBar />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: colors.background,
		paddingHorizontal: 16,
		paddingTop: 20
	},
	title: {
		fontSize: 18,
		fontFamily: 'Poppins-Bold',
		color: '#000000',
		marginBottom: 16,
		textAlign: 'center',
	},
	activitiesContainer: {
		backgroundColor: '#FFFFFF',
		borderRadius: 8,
		overflow: 'hidden',
		marginTop: 16,
	},
	headerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: '#F3F3F6',
	},
	headerLabel: {
		flex: 1,
		fontSize: 12,
		fontFamily: 'Poppins-Bold',
		color: '#888888',
	},
	balanceCard: {
		padding: 16,
		backgroundColor: 'white',
		borderRadius: 8,
		marginVertical: 16,
		...commonStyles.borderStyle,
	},
	mvcBalanceLabel: {
		fontFamily: 'Poppins-Regular',
		fontSize: 14,
		color: colors.lightText,
	},
	mvcBalanceValue: {
		fontFamily: 'Poppins-Bold',
		fontSize: 24,
		color: colors.textPrimary,
		lineHeight: 32,
	},

	actionsContainer: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 8,
		marginBottom: 48,
	},
	walletAction: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
    primaryText: {
        color: '#000',
	},
	separator: {
		height: 40,
		width: 1,
		backgroundColor: '#BCBEC9',
	},

	navigationBar: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
	},
	actionLabel: {},
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
		backgroundColor: '#F3F3F6'
	},
	column: {
		flex: 1,
		justifyContent: 'center',
		display: 'flex',
		alignItems: 'center'
	},
	startColumn: {
		flex: 1,
	},
	endColumn: {
		flex: 1,
		justifyContent: 'center',
		display: 'flex',
		alignItems: 'flex-end'
	},
	value: {
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
		color: '#888888',
	},
});

export default ActivitiesScreen;
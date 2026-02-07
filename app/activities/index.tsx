import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useMemo } from 'react';
import {
    ActivityIndicator,
	Dimensions,
	Image,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ActivitiesScreen = () => {
	const navigation = useNavigation<any>();
	const { user, jwt } = useAuth();
	const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
	const [selectedFilter, setSelectedFilter] = useState<string>('Dia');
	const filters = ['Dia', 'Semana', 'Mês', 'Ano'];

	// Função para filtrar atividades por período
	const filterActivitiesByPeriod = (activities: any[], filter: string) => {
		const now = new Date();
		const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		
		return activities.filter(activity => {
			const activityDate = new Date(activity.created_at);
			const activityDateOnly = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate());
			
			switch(filter) {
				case 'Dia':
					// Apenas corridas do dia atual
					return activityDateOnly.getTime() === currentDate.getTime();
					
				case 'Semana':
					// Últimos 7 dias (dia atual e 6 dias para trás)
					const sevenDaysAgo = new Date(currentDate);
					sevenDaysAgo.setDate(currentDate.getDate() - 6);
					return activityDateOnly >= sevenDaysAgo && activityDateOnly <= currentDate;
					
				case 'Mês':
					// Mês atual
					return activityDate.getMonth() === now.getMonth() && 
						   activityDate.getFullYear() === now.getFullYear();
					
				case 'Ano':
					// Ano atual
					return activityDate.getFullYear() === now.getFullYear();
					
				default:
					return true;
			}
		});
	};

	// Memoização das atividades filtradas para melhor performance
	const filteredActivities = useMemo(() => {
		return filterActivitiesByPeriod(activities, selectedFilter);
	}, [activities, selectedFilter])

	useEffect(() => {
		getRunList()
	}, []);

	const getRunList = async () => {
		try {
			if (jwt) {
                setLoading(true);
				const data = await getRun(jwt);

				// Ordena por data mais recente primeiro
				const sortedRuns = (data.runs || []).sort((a: any, b: any) => {
					return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
				});

				setActivities(sortedRuns);
			} else {
				console.error("Token JWT é nulo.");
			}
		} catch (error) {
			console.error("Erro ao buscar Atividades:", error);
		} finally {
			setLoading(false);
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
			{/* Header Personalizado */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<Image 
						source={require('@/assets/icons/arrow-right.png')} 
						style={styles.backIcon} 
					/>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Atividades Recentes</Text>
				<View style={styles.backButton} />
			</View>

			{/* Filtros */}
			<View style={styles.filtersWrapper}>
				<View style={styles.filtersContainer}>
					{filters.map((filter) => (
						<TouchableOpacity
							key={filter}
							style={[
								styles.filterButton,
								selectedFilter === filter && styles.filterButtonActive
							]}
							onPress={() => setSelectedFilter(filter)}
						>
							<Text style={[
								styles.filterText,
								selectedFilter === filter && styles.filterTextActive
							]}>
								{filter}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>

			{/* Gráfico de Barras */}
			<View style={styles.chartContainer}>
				<Image 
					source={require('@/assets/icons/chart.png')} 
					style={styles.chartImage}
					resizeMode="contain"
				/>
			</View>
			
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {
                loading ?  (
                    <ActivityIndicator size="large" color={ styles.primaryText.color} style={{marginTop: 21}} />
                ) : filteredActivities.length > 0 ? (
                    <View style={styles.activitiesContainer}>
                        {filteredActivities.map((activitie, index) => (
                            <TouchableOpacity key={`${activitie.id || index}`} onPress={() => {
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
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhuma atividade encontrada neste período</Text>
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
		paddingTop: 10,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	backIcon: {
		width: 22,
		height: 22,
		transform: [{ rotate: '180deg' }],
		tintColor: '#000000',
	},
	headerTitle: {
		fontSize: Math.min(SCREEN_WIDTH * 0.045, 18),
		fontFamily: 'Inter-Bold',
		color: '#040415',
	},
	filtersWrapper: {
		alignItems: 'center',
		marginTop: 12,
		marginBottom: 20,
	},
	filtersContainer: {
		backgroundColor: '#7C7D821A',
		borderRadius: 4,
		paddingHorizontal: 4,
		flexDirection: 'row',
		gap: 8,
		justifyContent: 'center',
	},
	filterButton: {
		paddingHorizontal: Math.max(SCREEN_WIDTH * 0.045, 16),
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: 'transparent',
		minWidth: Math.max(SCREEN_WIDTH * 0.18, 70),
		alignItems: 'center',
	},
	filterButtonActive: {
		backgroundColor: '#00D98D',
	},
	filterText: {
		fontSize: Math.min(SCREEN_WIDTH * 0.035, 14),
		fontFamily: 'Poppins-Medium',
		color: '#757575',
	},
	filterTextActive: {
		color: '#FFFFFF',
	},
	chartContainer: {
		paddingHorizontal: 16,
		marginBottom: 24,
		height: Math.min(SCREEN_HEIGHT * 0.2, 160),
		justifyContent: 'center',
		alignItems: 'center',
	},
	chartImage: {
		width: SCREEN_WIDTH * 0.85,
		height: '100%',
	},
	emptyContainer: {
		paddingVertical: Math.max(SCREEN_HEIGHT * 0.05, 40),
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	emptyText: {
		fontSize: Math.min(SCREEN_WIDTH * 0.035, 14),
		fontFamily: 'Poppins-Regular',
		color: '#757575',
		textAlign: 'center',
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
		marginTop: 8,
		marginHorizontal: 16,
		marginBottom: 16,
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
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { colors } from "@/constants/Screen";
import * as commonStyles from '../../constants/common';
import { getInventoryUserItems } from '../../apis/user.api';
import { useAuth } from '../../contexts/AuthContext';
import NavigationBar from '@/components/navigationBar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Items } from '@/contexts/RunContext';
import InventoryDetails from '@/components/InventoryDetails';

export const RARITY_ENUM: any = {
    COMMON: 'Comum',
    UNCOMMON: 'Incomum',
    RARE: 'Raro',
    EPIC: 'Épico',
    LEGENDARY: 'Lendário'
};

const InventoryScreen = () => {
    const navigation = useNavigation<any>();
    const { user, jwt } = useAuth();
    const [loading, setLoading] = useState<boolean>(false)
    const [inventoryItems, setInventoryItems] = useState<Items[]>([])

    const getInventoryList = async () => {
        try {
            if (jwt) {
                setLoading(true)
                const response = await getInventoryUserItems(jwt);
                if(response.success){
                    setInventoryItems(response.data.items)
                }
                setLoading(false)
            } else {
                console.error("Token JWT é nulo.");
            }
        } catch (error) {
            console.error("Erro ao buscar inventário:", error);
        }
    };

    const handlePress = (item: Items) => {
        navigation.navigate('ItemDetails', item);
    };

    useEffect(() => {
        getInventoryList()
    }, []);

    return (
        <View style={styles.root}>
            {
                loading ?  (
                <ActivityIndicator size="large" color={ styles.primaryText.color} style={{marginTop: 21}} />
            ) : (
                <FlatList
                    data={inventoryItems}
                    numColumns={1} // Exibe dois itens por linha
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.itemContainer} onPress={() => handlePress(item)}>
                            <InventoryDetails item={item} />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name="information-circle"
                                size={20}
                                color="#555"
                            />
                            <Text style={styles.emptyText}>Nenhum item no inventário.</Text>
                        </View>
                    )}
                />
            )
            }

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
        paddingTop: 14
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
    itemContainer: {
        flex: 1,
        marginVertical: 8, // Adiciona espaçamento entre os itens
        padding: 2, // Dá um pouco de respiro visual
        alignItems: "center",
        backgroundColor: "#FFF",
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
    },
});

export default InventoryScreen;
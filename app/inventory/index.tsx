import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
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
    const [loading, setLoading] = useState<boolean>(false);

    return (
        <View style={styles.root}>
            {/* Header Personalizado */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Image 
                        source={require('@/assets/icons/arrow-right.png')} 
                        style={styles.backIcon} 
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Inventário</Text>
                <View style={styles.headerButton} />
            </View>

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
        backgroundColor: colors.background,
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        width: 24,
        height: 24,
        transform: [{ rotate: '180deg' }],
        tintColor: '#000000',
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: '#040415',
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
        fontFamily: 'Inter-SemiBold',
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
});

export default InventoryScreen;
import NavigationBar from "@/components/navigationBar";
import { Items } from "@/contexts/RunContext";
import { useRoute } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import { Image as ExpoImage } from 'expo-image';
import { RARITY_ENUM } from "../inventory";

const ItemScreen = () => {
    const route = useRoute();
    const item: Items = route.params as any || {};

    return (
        
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <ExpoImage
                    source={{ uri: item.picture }}
                    style={styles.itemImage}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                />
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.infoBlock}>
                    <Text style={styles.label}>Nome:</Text>
                    <Text style={styles.value}>{item.name}</Text>
                </View>
                <View style={styles.infoBlock}>
                    <Text style={styles.label}>Descrição:</Text>
                    <Text style={styles.value}>{item.description}</Text>
                </View>
                <View style={[styles.infoBlock, {flexDirection: 'row', gap: 8}]}>
                    <Text style={styles.label}>Preço:</Text>
                    <Text style={styles.value}>{item.price}</Text>
                </View>
                <View style={[styles.infoBlock, {flexDirection: 'row', gap: 8}]}>
                    <Text style={styles.label}>Raridade:</Text>
                    <Text style={styles.value}>{RARITY_ENUM[item.rarity]}</Text>
                </View>
                <View style={[styles.infoBlock, {flexDirection: 'row', gap: 8}]}>
                    <Text style={styles.label}>Durabilidade:</Text>
                    <Text style={styles.value}>{item.durability}</Text>
                </View>
            </View>

            <View style={styles.navigationBar}>
                <NavigationBar />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    imageContainer: {
        width: '100%',
        alignItems: 'center',
    },
    itemImage: {
        width: 400, 
        height: 300,
        borderRadius: 8,
        resizeMode: 'contain',
    },
    infoContainer: {
        width: '100%',
    },
    infoBlock: {
        flexDirection: 'column',
        width: '100%',
        marginBottom: 8,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    value: {
        fontSize: 16,
        color: '#666',
    },
    navigationBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
});


export default ItemScreen;

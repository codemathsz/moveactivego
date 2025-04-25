import { RARITY_ENUM } from "@/app/inventory";
import { Items } from "@/contexts/RunContext";
import { Image, StyleSheet, Text, View } from "react-native";

const InventoryDetails = ({ item }: { item: Items }) =>{

    

    return(
        <View style={styles.container}>
            <View style={{width: '30%'}}>
                <Image source={{ uri: item.picture }} style={styles.itemImage} />
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.infoBlock}>
                    <Text>Nome: </Text>
                    <Text>{item.name}</Text>
                </View>
                <View style={styles.infoBlock}>
                    <Text>Preço: </Text>
                    <Text>{item.price}</Text>
                </View>
                <View style={styles.infoBlock}>
                    <Text>Raridade: </Text>
                    <Text>{RARITY_ENUM[item.rarity]}</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        borderRadius: 8,
        borderColor: "#000",
        padding: 4,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 4,
        backgroundColor: '#FFF',

        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },

    infoContainer:{
        width: '60%',
        display: 'flex',
        flexDirection: 'column'
    },

    infoBlock:{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 4,
        color: '#FFF'
    },
    itemImage: {
        width: 100,
        height: 100,
    },
})

export default InventoryDetails;

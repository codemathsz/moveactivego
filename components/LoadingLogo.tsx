import { SECONDARY_GREEN } from "@/constants/Colors";
import { ActivityIndicator, Image, View } from "react-native";

export function LoadingLogo() {
    return(
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: SECONDARY_GREEN }}>
            <Image
                source={require('../assets/images/logo-white.png')}
                resizeMode="contain"
            />
            <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
    )
}
import { Slot, Stack, useRouter } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { AuthProvider } from "@/contexts/AuthContext";
import { RunProvider } from "@/contexts/RunContext";
import { ProfileProvider } from "@/contexts/ProfileContext";

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const [loaded, setLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Atualizar com o estado correto
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Simular carregamento de fontes ou recursos
    setTimeout(() => {
      setLoaded(true);
      SplashScreen.hideAsync();
    }, 1000);
  }, []);

  if (!loaded) {
    return null; // Exibe tela de splash enquanto carrega
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={value => {
          setIsLoggedIn(true)    
        }}
      >
        <RunProvider>
        <ProfileProvider>
          <Stack screenOptions={{headerTitle: ''}}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login/index" options={{ headerShown: true}} />
            <Stack.Screen name="register/index" options={{ headerShown: true }} />
            <Stack.Screen name="dashboard/index" options={{ headerShown: false }} />
            <Stack.Screen name="resetPassword/index" options={{ headerShown: false }} />
          </Stack>
        </ProfileProvider>
        </RunProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { RootSiblingParent } from 'react-native-root-siblings';
import { AuthProvider } from '../contexts/AuthContext';
import { ProfileProvider } from '../contexts/ProfileContext';
import { RunProvider } from '../contexts/RunContext';
import { ToastProvider } from '../contexts/ToastContext';
import { screens } from '../constants/Screen';
import HomeScreen from './Home';
import RegisterScreen from './register';
import LoginScreen from './login';
import ResetPassword from './resetPassword';
import FreeRun from './freeRun';
import RunScreen from './run';
import DashboardScreen from './dashboard';
import Sidebar from '@/components/sidebar';
import VerificationScreen from './verification';
import ProfileScreen from './profile';
import ActivitiesScreen from './activities';
import { ActivityIndicator, Alert, StatusBar, Text, View } from 'react-native';
import InventoryScreen from './inventory';
import ItemScreen from './item';
import SettingsScreen from './settings';
import ChangePasswordScreen from './changePassword';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { checkBackgroundRestrictions } from '@/utils/checkBackground/checkBackgroundRestrictions';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { LoadingLogo } from '@/components/LoadingLogo';
import RunSummaryScreen from './runSummary';

// Previne a splash screen de esconder automaticamente
SplashScreen.preventAutoHideAsync();

const RootStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const LoggedInStack = createNativeStackNavigator();

function HomeStack() {
  return (

    <RootStack.Navigator screenOptions={{ presentation: 'modal' }}>

      <RootStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ ...screens.withoutHeader }}
      />
      <RootStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ ...screens.withoutHeader } as any}
      />
      <RootStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ ...screens.withoutHeader } as any}
      />
      <RootStack.Screen
        name="Recuperar senha"
        component={ResetPassword}
        options={{ ...screens.withoutHeader } as any}
      />
      <RootStack.Screen
        name="Verification"
        component={VerificationScreen as any}
        options={{ ...screens.withoutHeader } as any}
      />
    </RootStack.Navigator>
  );
}

function LoggedInStackScreen() {
  return (
    <LoggedInStack.Navigator initialRouteName='Dashboard'>
      <LoggedInStack.Screen
        name='freeRun'
        component={FreeRun}
        options={
          {
            ...screens.withHeader,
            title: "Corrida Livre",
          } as any
        }
      />
      <LoggedInStack.Screen
        name="Run"
        component={RunScreen}
        options={{ ...screens.withoutHeader } as any}
      />
      <LoggedInStack.Screen
        name="RunSummary"
        component={RunSummaryScreen}
        options={{ ...screens.withoutHeader } as any}
      />
      <LoggedInStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ ...screens.withoutHeader }}
      />
      <LoggedInStack.Screen
        name='Profile'
        component={ProfileScreen}
        options={{
          headerShown: false,
        } as any}
      />
      <LoggedInStack.Screen
        name='Activities'
        component={ActivitiesScreen}
        options={{
          headerShown: false,
        } as any}
      />
      <LoggedInStack.Screen
        name='Inventory'
        component={InventoryScreen}
        options={{
          headerShown: false,
        } as any}
      />
      <LoggedInStack.Screen
        name='ItemDetails'
        component={ItemScreen}
        options={{
          ...screens.withHeader,
          title: "",
        } as any}
      />
      <LoggedInStack.Screen
        name='Settings'
        component={SettingsScreen}
        options={{
          headerShown: false,
        } as any}
      />
      <LoggedInStack.Screen
        name='ChangePassword'
        component={ChangePasswordScreen}
        options={{
          headerShown: false,
        } as any}
      />

    </LoggedInStack.Navigator>
  );
}

function LoggedInDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={props => (
        // @ts-ignore
        <Sidebar {...props} />
      )}>
      <Drawer.Screen name="LoggedIn" component={LoggedInStackScreen} />
    </Drawer.Navigator>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          // Inter
          'Inter-Thin': require('../assets/fonts/Inter/Inter-Thin.ttf'),
          'Inter-ThinItalic': require('../assets/fonts/Inter/Inter-ThinItalic.ttf'),
          'Inter-ExtraLight': require('../assets/fonts/Inter/Inter-ExtraLight.ttf'),
          'Inter-ExtraLightItalic': require('../assets/fonts/Inter/Inter-ExtraLightItalic.ttf'),
          'Inter-Light': require('../assets/fonts/Inter/Inter-Light.ttf'),
          'Inter-LightItalic': require('../assets/fonts/Inter/Inter-LightItalic.ttf'),
          'Inter-Regular': require('../assets/fonts/Inter/Inter-Regular.ttf'),
          'Inter-Italic': require('../assets/fonts/Inter/Inter-Italic.ttf'),
          'Inter-Medium': require('../assets/fonts/Inter/Inter-Medium.ttf'),
          'Inter-MediumItalic': require('../assets/fonts/Inter/Inter-MediumItalic.ttf'),
          'Inter-SemiBold': require('../assets/fonts/Inter/Inter-SemiBold.ttf'),
          'Inter-SemiBoldItalic': require('../assets/fonts/Inter/Inter-SemiBoldItalic.ttf'),
          'Inter-Bold': require('../assets/fonts/Inter/Inter-Bold.ttf'),
          'Inter-BoldItalic': require('../assets/fonts/Inter/Inter-BoldItalic.ttf'),
          'Inter-ExtraBold': require('../assets/fonts/Inter/Inter-ExtraBold.ttf'),
          'Inter-ExtraBoldItalic': require('../assets/fonts/Inter/Inter-ExtraBoldItalic.ttf'),
          'Inter-Black': require('../assets/fonts/Inter/Inter-Black.ttf'),
          'Inter-BlackItalic': require('../assets/fonts/Inter/Inter-BlackItalic.ttf'),
          
          // InterDisplay for big titles
          'InterDisplay-Light': require('../assets/fonts/Inter/InterDisplay-Light.ttf'),
          'InterDisplay-Regular': require('../assets/fonts/Inter/InterDisplay-Regular.ttf'),
          'InterDisplay-Italic': require('../assets/fonts/Inter/InterDisplay-Italic.ttf'),
          'InterDisplay-Medium': require('../assets/fonts/Inter/InterDisplay-Medium.ttf'),
          'InterDisplay-MediumItalic': require('../assets/fonts/Inter/InterDisplay-MediumItalic.ttf'),
          'InterDisplay-SemiBold': require('../assets/fonts/Inter/InterDisplay-SemiBold.ttf'),
          'InterDisplay-SemiBoldItalic': require('../assets/fonts/Inter/InterDisplay-SemiBoldItalic.ttf'),
          'InterDisplay-Bold': require('../assets/fonts/Inter/InterDisplay-Bold.ttf'),
          
          // TT Trailers
          'Trailers-Bold': require('../assets/fonts/Trailers/Trailers-Trial-Bold.ttf'),
         
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn('Erro ao carregar fontes:', e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    loadFonts();
  }, []);

  async function checkRestritions() {
    const restriction = await checkBackgroundRestrictions()

    if(restriction){
        Alert.alert(
        restriction.title,
        restriction.description,
        [{ text: 'OK' }]
      );
    }
  }

  useEffect(() =>{
    checkRestritions()
  },[])

  if (!fontsLoaded) {
    return (
      <LoadingLogo />
    )
  }

  return (
    <NavigationContainer>
      <RootSiblingParent>
        <ToastProvider>
          <AuthProvider
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={(value: any) => {
              setIsLoggedIn(value);
            }}>
            {isLoggedIn ? (
              <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <RunProvider>
                  <ProfileProvider>
                    <LoggedInDrawer />
                  </ProfileProvider>
                </RunProvider>
              </SafeAreaView>
            ) : (
              <SafeAreaView style={{ flex: 1 }} edges={[]}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
                <HomeStack />
              </SafeAreaView>
            )}
          </AuthProvider>
        </ToastProvider>
      </RootSiblingParent>
    </NavigationContainer>
  );
}

export default App;
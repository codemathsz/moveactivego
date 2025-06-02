import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { RootSiblingParent } from 'react-native-root-siblings';
import { AuthProvider } from '../contexts/AuthContext';
import { ProfileProvider } from '../contexts/ProfileContext';
import { RunProvider } from '../contexts/RunContext';
import { screens } from '../constants/Screen';
import HomeScreen from './index';
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
import { StatusBar } from 'react-native';
import InventoryScreen from './inventory';
import ItemScreen from './item';
import * as Notifications from 'expo-notifications';

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
        options={{ ...screens.withHeader } as any}
      />
      <RootStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ ...screens.withHeader } as any}
      />
      <RootStack.Screen
        name="Recuperar senha"
        component={ResetPassword}
        options={{ ...screens.withHeader } as any}
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
        options={{ ...screens.withHeader, title: "Corrida", } as any}
      />
      <LoggedInStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ ...screens.withoutHeader }}
      />
      <LoggedInStack.Screen
        name='Profile'
        component={ProfileScreen}
        options={
          {
            ...screens.withHeader,
            title: "Meu Perfil",
          } as any
        }
      />
      <LoggedInStack.Screen
        name='Activities'
        component={ActivitiesScreen}
        options={{
          ...screens.withHeader,
          title: "Atividades Recentes",
        } as any}
      />
      <LoggedInStack.Screen
        name='Inventory'
        component={InventoryScreen}
        options={{
          ...screens.withHeader,
          title: "Inventário",
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

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  return (
    <RootSiblingParent>
      <AuthProvider
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={(value: any) => {
          setIsLoggedIn(value);
        }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {isLoggedIn ? (
          <RunProvider>
            <ProfileProvider>
              <LoggedInDrawer />
            </ProfileProvider>
          </RunProvider>
        ) : (
          <HomeStack />
        )}
      </AuthProvider>
    </RootSiblingParent>
  );
}

export default App;
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
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


  return (
    <RootSiblingParent>
      <AuthProvider
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={(value: any) => {
          setIsLoggedIn(value);
        }}>
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
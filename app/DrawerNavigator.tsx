import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Dashboard from './dashboard/index';
import Sidebar from '@/components/sidebar';
import HomeScreen from './Home';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (

    <Drawer.Navigator
    screenOptions={{ headerShown: false }}
    drawerContent={props => (
        // @ts-ignore
        <Sidebar {...props} />
    )}>
    <Drawer.Screen name="index" component={HomeScreen} />
    </Drawer.Navigator>
  
  );
}

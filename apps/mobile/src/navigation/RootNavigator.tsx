import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import FeedScreen from '../screens/FeedScreen';
import ExploreScreen from '../screens/ExploreScreen';
import CreateScreen from '../screens/CreateScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
const Drawer = createDrawerNavigator();
export default function RootNavigator(){
  return (<NavigationContainer>
    <Drawer.Navigator initialRouteName="Feed" screenOptions={{ headerShown:false }}>
      <Drawer.Screen name="Feed" component={FeedScreen} options={{ drawerIcon: ()=> '🏠' as any }}/>
      <Drawer.Screen name="Explorar" component={ExploreScreen} options={{ drawerIcon: ()=> '🔍' as any }}/>
      <Drawer.Screen name="Criar" component={CreateScreen} options={{ drawerIcon: ()=> '➕' as any }}/>
      <Drawer.Screen name="Mensagens" component={MessagesScreen} options={{ drawerIcon: ()=> '💬' as any }}/>
      <Drawer.Screen name="Perfil" component={ProfileScreen} options={{ drawerIcon: ()=> '👤' as any }}/>
    </Drawer.Navigator>
  </NavigationContainer>);
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import FormScreen from './src/screens/FormScreen';
import WebFormScreen from './src/screens/WebFormScreen.js';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: 'Aspect Health Forms',
            }}
          />
          <Stack.Screen 
            name="FormScreen" 
            component={FormScreen}
            options={{
              title: 'Form',
            }}
          />
          <Stack.Screen 
            name="WebFormScreen" 
            component={WebFormScreen}
            options={{
              title: 'Web Form',
            }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
} 
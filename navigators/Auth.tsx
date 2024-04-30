import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../src/screens/LoginScreen';
import SignUpScreen from '../src/screens/SignUpScreen';

const Stack = createNativeStackNavigator();

const Auth = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="Signup"
        component={SignUpScreen}
        options={{animation: 'slide_from_bottom'}}
      />
    </Stack.Navigator>
  );
};

export default Auth;

const styles = StyleSheet.create({});

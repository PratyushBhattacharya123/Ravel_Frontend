import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BlurView} from '@react-native-community/blur';
import HomeScreen from '../src/screens/HomeScreen';
import {Image} from 'react-native';
import SearchScreen from '../src/screens/SearchScreen';
import PostScreen from '../src/screens/PostScreen';
import NotificationScreen from '../src/screens/NotificationScreen';
import ProfileScreen from '../src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const Tabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarBackground: () => (
          <BlurView
            overlayColor=""
            blurAmount={25}
            style={styles.BlurViewStyles}
            className="bg-black/90"
          />
        ),
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({route}) => ({
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/3917/3917032.png',
              }}
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? '#dbeafe' : '#dbeafe50',
              }}
            />
          ),
        })}
      />

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={({route}) => ({
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3917/3917127.png',
              }}
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? '#dbeafe' : '#dbeafe50',
              }}
            />
          ),
        })}
      />

      <Tab.Screen
        name="Post"
        component={PostScreen}
        options={({route}) => ({
          tabBarStyle: {display: route.name === 'Post' ? 'none' : 'flex'},
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3917/3917442.png',
              }}
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? '#dbeafe' : '#dbeafe50',
              }}
            />
          ),
        })}
      />

      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={({route}) => ({
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077086.png',
              }}
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? '#dbeafe' : '#dbeafe50',
              }}
            />
          ),
        })}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={({route}) => ({
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
              }}
              style={{
                objectFit: 'fill',
                width: 28,
                height: 25,
                tintColor: focused ? '#dbeafe' : '#dbeafe50',
              }}
            />
          ),
        })}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 70,
    position: 'absolute',
    backgroundColor: 'black',
    borderTopWidth: 1,
    elevation: 0,
    borderTopColor: '#dbeafe20',
  },
  BlurViewStyles: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default Tabs;

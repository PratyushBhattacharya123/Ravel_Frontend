import {StyleSheet} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Tabs from './Tabs';
import UserProfileScreen from '../src/screens/UserProfileScreen';
import CreateRepliesScreen from '../src/screens/CreateReplies';
import PostDetailsScreen from '../src/screens/PostDetailsScreen';
import FollowerCard from '../src/components/FollowerCard';
import PostLikeCard from '../src/components/PostLikeCard';
import EditProfile from '../src/components/EditProfile';

const Stack = createNativeStackNavigator();

const Main = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {backgroundColor: 'black'},
      }}>
      <Stack.Screen
        name="Tab"
        component={Tabs}
        options={{animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="CreateReplies"
        component={CreateRepliesScreen}
        options={{animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="PostDetails"
        component={PostDetailsScreen}
        options={{animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="FollowerCard"
        component={FollowerCard}
        options={{animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="PostLikeCard"
        component={PostLikeCard}
        options={{animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{animation: 'slide_from_bottom'}}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({});

export default Main;

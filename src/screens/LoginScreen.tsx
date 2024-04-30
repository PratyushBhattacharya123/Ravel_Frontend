import {
  Alert,
  Image,
  Platform,
  StatusBar,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useLoginMutation} from '../../redux/features/auth/authApi';

const LoginScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [login, {error, isSuccess, isLoading, data}] = useLoginMutation();

  useEffect(() => {
    if (error) {
      if ('data' in error) {
        const errorData = error as any;
        if (Platform.OS === 'android') {
          ToastAndroid.show(errorData.data.message, ToastAndroid.LONG);
        } else {
          Alert.alert(errorData.data.message);
        }
      }
    }
    if (isSuccess) {
      const message = data?.message || 'Login Successful';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert(message);
      }
      setEmail('');
      setPassword('');
    }
  }, [error, isSuccess, data, navigation]);

  const submitHandler = () => {
    if (password === '' || email === '') {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Please fill all the fields', ToastAndroid.LONG);
      } else {
        Alert.alert('Please fill all the fields');
      }
    } else {
      console.log(email, password);
      login({email, password});
    }
  };

  const onPressHandler = () => {
    setEmail('');
    setPassword('');
    navigation.navigate('Signup');
  };

  return (
    <View className="flex-1 items-center justify-center bg-black font-sans">
      <StatusBar backgroundColor={'black'} />
      <View className="w-[80%]">
        <View className="flex items-center justify-center mb-4">
          <Image
            source={require('../assets/ravel_logo.png')}
            width={50}
            height={50}
            className="object-cover w-[60px] h-[75px]"
          />
          <Text className="text-[28px] font-sans text-center text-blue-50 font-semibold mt-4">
            Welcome to <Text className="text-blue-400 font-bold">Ravel</Text>
          </Text>
        </View>
        <TextInput
          placeholder="Enter your email address"
          placeholderTextColor={'#ffffff90'}
          className="w-full h-[50px] border bg-fuchsia-100/30 px-4 my-4 text-blue-100 rounded-md"
          onChangeText={text => setEmail(text)}
          value={email}
        />
        <View className="relative">
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor={'#ffffff90'}
            className="w-full h-[50px] border bg-fuchsia-100/30 px-4 mb-4 text-blue-100 rounded-md"
            onChangeText={text => setPassword(text)}
            secureTextEntry={show ? false : true}
            value={password}
          />
          {password && (
            <TouchableOpacity onPress={() => setShow(!show)}>
              {!show ? (
                <Image
                  source={require('../assets/eye_closed.png')}
                  width={50}
                  height={50}
                  className="object-cover w-[22px] h-[22px] absolute right-4 bottom-[28px] opacity-50 z-[100000]"
                />
              ) : (
                <Image
                  source={require('../assets/eye_open.png')}
                  width={50}
                  height={50}
                  className="object-cover w-[25px] h-[25px] absolute right-4 bottom-[28px] opacity-50 z-[100000]"
                />
              )}
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          className={`w-full h-[50px] border bg-blue-700 px-4 mb-2 rounded-md flex items-center justify-center ${
            (!email || !password || isLoading) && 'opacity-50'
          }`}
          onPress={submitHandler}
          disabled={isLoading || !email || !password}>
          <Text className="text-blue-100 font-semibold text-[16px]">
            Log In
          </Text>
        </TouchableOpacity>
        <Text
          className="mt-4 text-blue-50 font-normal text-[16px]"
          onPress={onPressHandler}>
          Don't have any account?{' '}
          <Text className="text-blue-400 font-semibold">Register</Text>
        </Text>
      </View>
    </View>
  );
};

export default LoginScreen;

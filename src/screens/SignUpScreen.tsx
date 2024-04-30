import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import {useRegisterMutation} from '../../redux/features/auth/authApi';

const SignUpScreen = ({navigation}: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [register, {error, isSuccess, isLoading, data}] = useRegisterMutation();

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
      const message = data?.message || 'Registration Successful';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert(message);
      }
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAvatar('');
      navigation.navigate('Login');
    }
  }, [error, isSuccess, data, navigation]);

  const uploadImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.8,
      includeBase64: true,
    }).then((image: ImageOrVideo | null) => {
      if (image) {
        // @ts-ignore
        setAvatar('data:image/jpeg;base64,' + image.data);
      }
    });
  };

  const handleSubmit = () => {
    if (
      (password !== '' || confirmPassword !== '') &&
      password !== confirmPassword
    ) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Password is not matching', ToastAndroid.SHORT);
      } else {
        Alert.alert('Password is not matching');
      }
    } else {
      if (
        password === '' ||
        name === '' ||
        email === '' ||
        confirmPassword === ''
      ) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Please fill all the fields', ToastAndroid.LONG);
        } else {
          Alert.alert('Please fill all the fields');
        }
      } else {
        console.log(name, email, password, avatar);
        register({name, email, password, avatar});
      }
    }
  };

  const onPressHandler = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAvatar('');
    navigation.navigate('Login');
  };

  return (
    <View className="flex-1 items-center justify-center bg-black font-sans">
      <StatusBar backgroundColor={'black'} />
      <ScrollView
        className="w-[80%] flex-grow"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          justifyContent: 'center',
          flexDirection: 'column',
          flex: 1,
        }}>
        <View className="flex items-center justify-center mb-4">
          <Image
            source={require('../assets/ravel_logo.png')}
            width={50}
            height={50}
            className="object-cover w-[60px] h-[75px]"
          />
          <Text className="text-[28px] font-sans text-center text-blue-50 font-semibold mt-4">
            Join <Text className="text-blue-400 font-bold">Ravel</Text>
          </Text>
          <Text className="text-[20px] font-sans text-center text-blue-200 font-medium mt-2">
            Create an account for free!
          </Text>
        </View>
        <TextInput
          placeholder="Enter your name"
          placeholderTextColor={'#ffffff90'}
          className="w-full h-[50px] border bg-fuchsia-100/30 px-4 mt-4 text-blue-100 rounded-md"
          onChangeText={text => setName(text)}
          value={name}
        />
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
        <View className="relative">
          <TextInput
            placeholder="Re-enter your password"
            placeholderTextColor={'#ffffff90'}
            className="w-full h-[50px] border bg-fuchsia-100/30 px-4 mb-4 text-blue-100 rounded-md"
            onChangeText={text => setConfirmPassword(text)}
            secureTextEntry={showConfirm ? false : true}
            value={confirmPassword}
          />
          {confirmPassword && (
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              {!showConfirm ? (
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
          className="flex-row items-center mb-4"
          onPress={uploadImage}>
          {avatar ? (
            <Image
              source={{
                uri: avatar,
              }}
              className="w-[30px] h-[30px] rounded-full"
            />
          ) : (
            <Image
              source={require('../assets/upload.png')}
              className="w-[30px] h-[30px] rounded-full opacity-50"
            />
          )}
          <Text className="text-blue-50 opacity-90 ml-2">
            Upload Profile Pic
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`w-full h-[50px] border bg-blue-700 px-4 mb-2 rounded-md flex items-center justify-center ${
            (!email || !password || !confirmPassword || !name || isLoading) &&
            'opacity-50'
          }`}
          onPress={handleSubmit}
          disabled={
            isLoading || !email || !password || !confirmPassword || !name
          }>
          <Text className="text-blue-100 font-semibold text-[16px]">
            Register
          </Text>
        </TouchableOpacity>
        <Text
          className="mt-4 text-blue-50 font-normal text-[16px]"
          onPress={onPressHandler}>
          Already have an account?{' '}
          <Text className="text-blue-400 font-semibold">Login</Text>
        </Text>
      </ScrollView>
    </View>
  );
};

export default SignUpScreen;

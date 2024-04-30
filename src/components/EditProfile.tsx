import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Image} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {TextInput} from 'react-native';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import axios from 'axios';
import {URI} from '../../redux/URI';
import {loadUser} from '../../redux/actions/userAction';
import {
  useGetAllUsersQuery,
  useUpdateUserInfoMutation,
} from '../../redux/features/users/userApi';

type Props = {
  navigation: any;
};

const EditProfile = ({navigation}: Props) => {
  const defaultAvatar =
    'https://res.cloudinary.com/dmffc94ez/image/upload/v1713702571/avatar_liey1j.png';
  const {user} = useSelector((state: any) => state.auth);
  const [userFullData, setUserFullData] = useState({
    _id: '',
    name: '',
    bio: '',
    role: '',
    userName: '',
    avatar: {url: ''},
    followers: [],
    following: [],
  });
  const {
    data: usersData,
    isLoading,
    isSuccess,
    refetch,
  } = useGetAllUsersQuery({}, {refetchOnMountOrArgChange: true});

  const [
    updateUserInfo,
    {
      isSuccess: userUpdateSuccess,
      isLoading: userUpdateLoading,
      error: userUpdateError,
    },
  ] = useUpdateUserInfoMutation();

  useEffect(() => {
    if (userFullData?.avatar?.url) {
      setAvatar(userFullData?.avatar?.url);
    }
  }, [userFullData]);

  useEffect(() => {
    if (userUpdateSuccess) {
      console.log('Success');
      navigation.navigate('Profile');
    }
  }, [userUpdateSuccess, navigation]);

  useEffect(() => {
    const tempUser = usersData?.users.filter(
      (item: any) => item.email === user.email,
    )[0];

    setUserFullData(tempUser);
  }, [user, usersData]);
  const [avatar, setAvatar] = useState(defaultAvatar);

  const handleSubmitHandler = async () => {
    if (userFullData.name.length !== 0 && userFullData.userName.length !== 0) {
      await updateUserInfo({
        user: userFullData,
        name: userFullData.name,
        userName: userFullData.userName?.toLowerCase(),
        bio: userFullData.bio,
      }).then((res: any) => {
        refetch();
      });
    }
  };

  const ImageUpload = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.8,
      includeBase64: true,
    }).then((image: ImageOrVideo | null) => {
      if (image) {
        // setImage('data:image/jpeg;base64,' + image.data);
        axios
          .put(`${URI}/update-avatar`, {
            user: userFullData,
            // @ts-ignore
            avatar: 'data:image/jpeg;base64,' + image?.data,
          })
          .then((res: any) => {
            refetch();
          });
      }
    });
  };

  return (
    <SafeAreaView className="bg-black flex-1">
      <View className="flex-row items-center justify-between p-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="h-10 w-10 flex items-center justify-center">
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/2223/2223615.png',
                }}
                height={25}
                width={25}
                tintColor={'#dbeafe'}
              />
            </TouchableOpacity>
            <Text className="pl-2 text-[20px] font-[600] text-blue-300">
              Edit Profile
            </Text>
          </View>
          <View className="flex-1 items-end">
            <TouchableOpacity
              onPress={handleSubmitHandler}
              disabled={userUpdateLoading}>
              <Text
                className={`text-[20px] text-blue-50 mr-2 ${
                  userUpdateLoading && 'opacity-50'
                }`}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View className="h-[90%] items-center justify-center">
        <View className="w-[90%] p-3 min-h-[300] h-max border rounded-[10px] border-blue-50/20">
          <View className="flex-row">
            <View className="w-full flex-row justify-between">
              <View>
                <Text className="text-[18px] font-[600] text-blue-50 ml-1">
                  Name
                </Text>
                <TextInput
                  value={userFullData?.name}
                  onChangeText={e =>
                    setUserFullData({...userFullData, name: e})
                  }
                  placeholder="Enter your name..."
                  placeholderTextColor={'#dbeafe60'}
                  className="text-[16px] text-blue-50/80"
                />
                <TextInput
                  value={userFullData?.userName}
                  onChangeText={e =>
                    setUserFullData({...userFullData, userName: e})
                  }
                  placeholder="Enter your userName..."
                  placeholderTextColor={'#dbeafe60'}
                  className="text-[16px] text-blue-50/80"
                />
              </View>
              <TouchableOpacity onPress={ImageUpload}>
                <Image
                  source={{uri: avatar}}
                  width={60}
                  height={60}
                  borderRadius={100}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View className="w-full border-t border-blue-50/20 pt-2">
            <Text className="text-[18px] font-[500] text-blue-50 ml-1">
              Bio
            </Text>
            <TextInput
              value={userFullData?.bio}
              onChangeText={e => setUserFullData({...userFullData, bio: e})}
              placeholder="Enter your bio..."
              placeholderTextColor={'#dbeafe60'}
              className="text-[16px] text-blue-50/90 -mt-6"
              multiline={true}
              numberOfLines={4}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EditProfile;

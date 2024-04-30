import {
  View,
  Text,
  SafeAreaView,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import Loader from '../common/Loader';
import {
  useGetAllUsersQuery,
  useUpdateFollowUnfollowUserMutation,
} from '../../redux/features/users/userApi';

type Props = {
  navigation: any;
};

const SearchScreen = ({navigation}: Props) => {
  const defaultAvatar =
    'https://res.cloudinary.com/dmffc94ez/image/upload/v1713702571/avatar_liey1j.png';

  const [data, setData] = useState([
    {
      _id: '',
      name: '',
      userName: '',
      avatar: {url: ''},
      followers: [],
      role: '',
    },
  ]);
  const [users, setUsers] = useState([]);
  const [userFullData, setUserFullData] = useState({
    _id: '',
    name: '',
    userName: '',
    avatar: {url: ''},
    following: [],
  });
  const {user} = useSelector((state: any) => state.auth);
  const {
    data: usersData,
    isLoading,
    isSuccess,
    refetch,
  } = useGetAllUsersQuery({}, {refetchOnMountOrArgChange: true});

  const [
    updateFollowUnfollowUser,
    {isSuccess: followUnfollowSuccess, isLoading: followUnfollowLoading},
  ] = useUpdateFollowUnfollowUserMutation();

  useEffect(() => {
    const tempUser = usersData?.users.filter(
      (item: any) => item.email === user.email,
    )[0];

    setUserFullData(tempUser);
  }, [user, usersData]);

  useEffect(() => {
    if (isSuccess) {
      const usersDataWithoutLoggedInUser = usersData?.users.filter(
        (item: any) => item.email !== user.email,
      );
      setUsers(usersDataWithoutLoggedInUser);
      setData(usersDataWithoutLoggedInUser);
    }
  }, [isSuccess, usersData, user]);

  const handleSearchChange = (text: string) => {
    if (text.length !== 0) {
      const filteredUsers =
        users &&
        users.filter((item: any) =>
          item.name.toLowerCase().includes(text.toLowerCase()),
        );
      setData(filteredUsers);
    } else {
      setData(users);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <SafeAreaView className="bg-black flex-1 font-sans">
          <View className="p-3">
            <Text className="text-[28px] text-blue-300 font-semibold mx-2">
              Search
            </Text>
            <View className="relative mb-3 mt-1">
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/2811/2811806.png',
                }}
                height={20}
                width={20}
                className="absolute top-[18px] left-2"
                tintColor={'#dbeafe70'}
              />
              <TextInput
                onChangeText={text => handleSearchChange(text)}
                placeholder="Search"
                placeholderTextColor={'#dbeafe70'}
                className="w-full h-[38px] bg-[#ffffff15] rounded-[8px] pl-8 text-blue-100 mt-[10px]"
              />
            </View>
            <FlatList
              data={data}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => {
                const handleFollowUnfollow = async (i: any) => {
                  try {
                    const userId = userFullData._id;
                    const followUserId = i._id;
                    const isFollowedBefore =
                      userFullData &&
                      userFullData.following &&
                      userFullData.following.find(
                        (d: any) => d.userId === followUserId,
                      );

                    // Update Redux state immediately
                    const updatedData = data.map((userObj: any) =>
                      userObj._id === followUserId
                        ? {
                            ...userObj,
                            followers: isFollowedBefore
                              ? userObj.followers.filter(
                                  (follower: any) => follower.userId !== userId,
                                )
                              : [...userObj.followers, {userId}],
                          }
                        : userObj,
                    );

                    setData(updatedData);

                    const tempUpdatedUserData: any = {
                      ...userFullData,
                      following: isFollowedBefore
                        ? userFullData.following.filter(
                            (following: any) =>
                              following.userId !== followUserId,
                          )
                        : [...userFullData.following, {userId: followUserId}],
                    };

                    setUserFullData(tempUpdatedUserData);

                    await updateFollowUnfollowUser({
                      user,
                      followUserId: i._id,
                    });
                    refetch();
                  } catch (error) {
                    console.log(error, 'error');
                  }
                };
                return (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('UserProfile', {
                        item: item,
                      })
                    }>
                    <View className="flex-row mb-3">
                      <Image
                        source={{uri: item?.avatar?.url || defaultAvatar}}
                        width={30}
                        height={30}
                        borderRadius={100}
                      />
                      <View className="w-[90%] flex-row justify-between border-b border-[#00000020] pb-2">
                        <View>
                          <View className="flex-row items-center relative">
                            <Text className="pl-3 text-[18px] text-blue-50/80">
                              {item.name}
                            </Text>
                            {item?.role === 'Admin' && (
                              <Image
                                source={{
                                  uri: 'https://cdn-icons-png.flaticon.com/128/1828/1828640.png',
                                }}
                                width={16}
                                height={16}
                                className="ml-2"
                              />
                            )}
                          </View>

                          {item?.userName && (
                            <Text className="pl-3 text-[15px] text-blue-50/40 mt-1 italic">
                              @{item.userName.toLowerCase()}
                            </Text>
                          )}
                          <Text className="pl-3 mt-1 text-[16px] text-blue-50/60">
                            {item.followers.length}{' '}
                            {item?.followers.length > 1
                              ? 'followers'
                              : 'follower'}
                          </Text>
                        </View>
                        <View>
                          <TouchableOpacity
                            className="rounded-[8px] w-[100px] flex-row justify-center items-center h-[35px] bg-[#ffffff15]"
                            onPress={() => handleFollowUnfollow(item)}
                            disabled={followUnfollowLoading}>
                            <Text className="text-blue-50/50">
                              {item.followers.find(
                                (i: any) => i.userId === user._id,
                              )
                                ? 'Following'
                                : 'Follow'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

export default SearchScreen;

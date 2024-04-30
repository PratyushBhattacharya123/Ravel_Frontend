import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import getTimeDuration from '../common/TimeGenerator';
import axios from 'axios';
import {URI} from '../../redux/URI';
import Loader from '../common/Loader';
import {
  useGetAllUsersQuery,
  useGetUserAllNotificationsQuery,
} from '../../redux/features/users/userApi';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useGetAllPostsQuery} from '../../redux/features/posts/postApi';
// import {useGetUserAllNotificationsQuery} from '../../redux/features/users/userApi';

type Props = {
  navigation: any;
};

const NotificationScreen = ({navigation}: Props) => {
  const tabBarHeight = useBottomTabBarHeight();
  const defaultAvatar =
    'https://res.cloudinary.com/dmffc94ez/image/upload/v1713702571/avatar_liey1j.png';
  const {user} = useSelector((state: any) => state.auth);
  const userId = user?._id;
  const [refreshing, setRefreshing] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  // const [isError, setIsError] = useState(false);
  // const [allUserNotifications, setAllUserNotifications] = useState<any[]>([]);
  const {
    data: usersData,
    isLoading: usersLoading,
    isSuccess,
  } = useGetAllUsersQuery({}, {refetchOnMountOrArgChange: true});
  const {
    data,
    isLoading,
    isSuccess: notificationDataSuccess,
    error,
    refetch,
  } = useGetUserAllNotificationsQuery(userId);
  const [users, setUsers] = useState([
    {
      _id: '',
      name: '',
      userName: '',
      avatar: {url: ''},
      followers: [],
      role: '',
    },
  ]);
  const [allUserNotifications, setAllUserNotifications] = useState([
    {
      _id: '',
      creator: {
        _id: '',
        name: '',
      },
      type: '',
      title: '',
      postId: '',
      userId: '',
      createdAt: new Date(),
    },
  ]);
  const {
    data: postsData,
    isSuccess: postsSuccess,
    error: postsError,
    refetch: postsRefetch,
  } = useGetAllPostsQuery({}, {refetchOnMountOrArgChange: true});
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [active, setActive] = useState(0);
  const refreshingHeight = 100;

  const labels = ['All', 'Replies', 'Mentions'];

  useEffect(() => {
    if (postsSuccess) {
      setAllPosts(postsData.posts);
    }
  }, [postsSuccess, postsData]);

  const handleTabPress = (index: number) => {
    setActive(index);
  };

  useEffect(() => {
    if (isSuccess) {
      const allUsersData = usersData?.users.filter(
        (item: any) => item.email !== user.email,
      );
      setUsers(allUsersData);
    }
    if (notificationDataSuccess) {
      setAllUserNotifications(data.notifications);
    }
  }, [isSuccess, usersData, user, data, notificationDataSuccess]);

  console.log(allUserNotifications);

  return (
    <>
      <SafeAreaView className="bg-black flex-1 font-sans">
        <>
          {usersLoading && isLoading ? (
            <Loader />
          ) : (
            <View className="p-3">
              <Text className="text-[28px] text-blue-300 font-semibold mx-2">
                Notifications
              </Text>
              <View className="w-full flex-row my-5 justify-between mb-7">
                {labels.map((label, index) => (
                  <TouchableOpacity
                    key={index}
                    className="w-[29vw] h-[38px] rounded-md flex items-center justify-center"
                    style={{
                      backgroundColor:
                        active === index ? '#dbeafe50' : '#dbeafe',
                    }}
                    onPress={() => handleTabPress(index)}>
                    <Text
                      className={`${
                        active !== index ? 'text-blue-950' : 'text-[#fff]'
                      } text-[18px] font-[600]`}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* All activites */}
              {active === 0 && allUserNotifications?.length === 0 && (
                <View className="w-full h-[80px] flex items-center justify-center">
                  <Text className="text-[16px] text-blue-50/50 mt-5">
                    You have no notifications yet!
                  </Text>
                </View>
              )}

              {/* All Replies */}
              {active === 1 && (
                <View className="w-full h-[80px] flex items-center justify-center">
                  <Text className="text-[16px] text-blue-50/50 mt-5">
                    You have no replies yet!
                  </Text>
                </View>
              )}

              {/* All Replies */}
              {active === 2 && (
                <View className="w-full h-[80px] flex items-center justify-center">
                  <Text className="text-[16px] text-blue-50/50 mt-5">
                    You have no mentions yet!
                  </Text>
                </View>
              )}

              <View style={{marginBottom: tabBarHeight * 2}}>
                {active === 0 && (
                  <FlatList
                    data={allUserNotifications}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                          setRefreshing(true);
                          refetch().then(() => {
                            setRefreshing(false);
                          });
                        }}
                        progressViewOffset={refreshingHeight}
                      />
                    }
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}) => {
                      const time = item.createdAt;
                      const formattedDuration = getTimeDuration(time);

                      const handleNavigation = async (e: any) => {
                        const id = item.creator._id;

                        await axios.get(`${URI}/get-user/${id}`).then(res => {
                          if (item.type === 'Follow') {
                            navigation.navigate('UserProfile', {
                              item: res.data.user,
                            });
                          } else {
                            navigation.navigate('PostDetails', {
                              data: allPosts.find(
                                (i: any) => i._id === item.postId,
                              ),
                            });
                          }
                        });
                      };

                      return (
                        <TouchableOpacity
                          onPress={() => handleNavigation(item)}>
                          <View className="flex-row" key={item._id}>
                            <View className="relative">
                              <Image
                                source={{
                                  uri:
                                    users.find(
                                      (user: any) =>
                                        user._id === item.creator._id,
                                    )?.avatar.url || defaultAvatar,
                                }}
                                width={40}
                                height={40}
                                borderRadius={100}
                              />
                              {item.type === 'Like' && (
                                <View className="absolute bottom-6 border-[2px] border-[#fff] right-[-5px] h-[25px] w-[25px] bg-[#eb4545] rounded-full items-center justify-center flex-row">
                                  <Image
                                    source={{
                                      uri: 'https://cdn-icons-png.flaticon.com/512/2589/2589175.png',
                                    }}
                                    tintColor={'#fff'}
                                    width={15}
                                    height={15}
                                  />
                                </View>
                              )}

                              {item.type === 'Follow' && (
                                <View className="absolute bottom-6 border-[2px] border-[#fff] right-[-5px] h-[25px] w-[25px] bg-[#5a49d6] rounded-full items-center justify-center flex-row">
                                  <Image
                                    source={{
                                      uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
                                    }}
                                    tintColor={'#fff'}
                                    width={12}
                                    height={12}
                                  />
                                </View>
                              )}
                            </View>
                            <View className="pl-4 mb-3">
                              <View className="flex-row w-full items-center border-b pb-3 border-blue-50/20">
                                <View className="w-full">
                                  <View className="flex-row items-center">
                                    <Text className="text-[18px] text-blue-50/90 font-[600]">
                                      {item.creator.name}
                                    </Text>
                                    <Text className="pl-2 text-[16px] text-blue-50/60 font-[600]">
                                      {formattedDuration}
                                    </Text>
                                  </View>
                                  <Text className="text-[16px] text-blue-50/70 font-[500]">
                                    {item.title}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
              </View>
            </View>
          )}
        </>
      </SafeAreaView>
    </>
  );
};

export default NotificationScreen;

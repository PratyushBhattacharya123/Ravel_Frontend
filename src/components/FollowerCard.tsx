import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {
  useGetAllUsersQuery,
  useUpdateFollowUnfollowUserMutation,
} from '../../redux/features/users/userApi';
// import {
//   followUserAction,
//   loadUser,
//   unfollowUserAction,
// } from '../../redux/actions/userAction';

type Props = {
  route: any;
  navigation: any;
};

const FollowerCard = ({navigation, route}: Props) => {
  const activeNumber = route.params.activeNumber;
  const defaultAvatar =
    'https://res.cloudinary.com/dmffc94ez/image/upload/v1713702571/avatar_liey1j.png';
  const followers = route.params.followers;
  const item = route.params.item;
  const following = route.params.following;
  const [data, setData] = useState(followers);
  const [active, setActive] = useState(activeNumber);
  const {user} = useSelector((state: any) => state.auth);
  const [users, setUsers] = useState<any[]>([]);
  const [userFullData, setUserFullData] = useState<any>();

  console.log(item);

  const [
    updateFollowUnfollowUser,
    {isSuccess: followUnfollowSuccess, isLoading: followUnfollowLoading},
  ] = useUpdateFollowUnfollowUserMutation();

  const {
    data: usersData,
    isLoading,
    isSuccess,
    refetch,
  } = useGetAllUsersQuery({}, {refetchOnMountOrArgChange: true});

  useEffect(() => {
    if (isSuccess) {
      setUsers(usersData.users);
    }
  }, [isSuccess, usersData]);

  useEffect(() => {
    const tempUser = usersData?.users.filter(
      (i: any) => i.email === user.email,
    )[0];

    setUserFullData(tempUser);
  }, [user, usersData]);

  useEffect(() => {
    if (users) {
      if (followers) {
        const fullUsers = users.filter((u: any) =>
          followers.some((i: any) => i.userId === u._id),
        );
        setData(fullUsers);
      }
      if (active === 1) {
        if (following) {
          const fullUsers = users.filter((u: any) =>
            following.some((i: any) => i.userId === u._id),
          );
          setData(fullUsers);
        }
      }
    }
  }, [followers, following, active, users]);

  return (
    <SafeAreaView className="bg-black flex-1">
      <View className="p-3 relative mb-2">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="h-10 w-10 flex items-center justify-center ml-2">
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/2223/2223615.png',
              }}
              height={25}
              width={25}
              tintColor={'#dbeafe'}
            />
          </TouchableOpacity>
          <Text className="pl-2 text-[20px] font-[500] text-blue-50/90">
            {item?.name}
          </Text>
        </View>
        <View className="w-full pb-4">
          {active === 0 && (
            <>
              <View className="w-[33%] absolute h-[1px] bg-blue-100 top-[56px]" />
              <View className="w-[33%] absolute h-[1px] bg-blue-50/50 left-[33%] top-[56px]" />
              <View className="w-[33%] absolute h-[1px] bg-blue-50/50 left-[66%] top-[56px]" />
            </>
          )}
          {active === 1 && (
            <>
              <View className="w-[35%] absolute h-[1px] bg-blue-50/50 top-[56px]" />
              <View className="w-[33%] absolute h-[1px] bg-blue-100 left-[35%] top-[56px]" />
              <View className="w-[33%] absolute h-[1px] bg-blue-50/50 left-[66%] top-[56px]" />
            </>
          )}
          {active === 2 && (
            <>
              <View className="w-[33%] absolute h-[1px] bg-blue-50/50 top-[56px]" />
              <View className="w-[37%] absolute h-[1px] bg-blue-50/50 left-[33%] top-[56px]" />
              <View className="w-[30%] absolute h-[1px] bg-blue-100 left-[70%] top-[56px]" />
            </>
          )}
          <View className="w-[90%] pt-5 m-auto flex-row justify-between">
            <TouchableOpacity
              onPress={() => {
                setActive(0);
                refetch();
              }}>
              <Text
                className="text-[18px] text-blue-50"
                style={{opacity: active === 0 ? 1 : 0.6}}>
                {userFullData?.followers?.length}{' '}
                {userFullData?.followers?.length > 1 ? 'followers' : 'follower'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setActive(1);
                refetch();
              }}>
              <Text
                className="text-[18px] text-blue-50"
                style={{opacity: active === 1 ? 1 : 0.6}}>
                {userFullData?.following?.length} following
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActive(2)}>
              <Text
                className="text-[18px] text-blue-50"
                style={{opacity: active === 2 ? 1 : 0.6}}>
                Pending
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {active === 0 && userFullData?.followers?.length === 0 && (
        <Text className="pt-3 text-center text-blue-50/50 text-[16px]">
          No followers yet!
        </Text>
      )}

      {active === 1 && userFullData?.following?.length === 0 && (
        <Text className="pt-3 text-center text-blue-50/50 text-[16px]">
          No following yet!
        </Text>
      )}

      {active !== 2 && (
        <FlatList
          data={data}
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
                        (f: any) => f.userId !== followUserId,
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
              <>
                {active === 0 && userFullData?.followers.length > 0 && (
                  <TouchableOpacity
                    className="w-[90%] m-auto pb-3 flex-row justify-between"
                    onPress={() =>
                      navigation.navigate('UserProfile', {
                        item,
                      })
                    }>
                    <View className="flex-row">
                      <Image
                        source={{uri: item?.avatar?.url || defaultAvatar}}
                        width={40}
                        height={40}
                        borderRadius={100}
                      />
                      <View className="pl-4">
                        <View className="flex-row items-center relative">
                          <Text className="text-[18px] text-blue-50/90">
                            {item?.name}
                          </Text>
                          {item.role === 'Admin' && (
                            <Image
                              source={{
                                uri: 'https://cdn-icons-png.flaticon.com/128/1828/1828640.png',
                              }}
                              width={15}
                              height={15}
                              className="ml-1"
                            />
                          )}
                        </View>
                        <Text className="text-[15px] text-blue-50/50 italic">
                          {item?.userName?.toLowerCase()}
                        </Text>
                      </View>
                    </View>
                    {user._id !== item._id && (
                      <TouchableOpacity
                        className="rounded-[8px] w-[100px] flex-row justify-center items-center h-[35px] bg-[#ffffff15]"
                        onPress={() => handleFollowUnfollow(item)}>
                        <Text className="text-blue-50/50">
                          {item?.followers?.find(
                            (i: any) => i.userId === user._id,
                          )
                            ? 'Following'
                            : 'Follow'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                )}
                {active === 1 && userFullData?.following.length > 0 && (
                  <TouchableOpacity
                    className="w-[90%] m-auto pb-3 flex-row justify-between"
                    onPress={() =>
                      navigation.navigate('UserProfile', {
                        item,
                      })
                    }>
                    <View className="flex-row">
                      <Image
                        source={{uri: item?.avatar?.url || defaultAvatar}}
                        width={40}
                        height={40}
                        borderRadius={100}
                      />
                      <View className="pl-4">
                        <View className="flex-row items-center relative">
                          <Text className="text-[18px] text-blue-50/90">
                            {item?.name}
                          </Text>
                          {item.role === 'Admin' && (
                            <Image
                              source={{
                                uri: 'https://cdn-icons-png.flaticon.com/128/1828/1828640.png',
                              }}
                              width={15}
                              height={15}
                              className="ml-1"
                            />
                          )}
                        </View>
                        <Text className="text-[15px] text-blue-50/50 italic">
                          {item?.userName?.toLowerCase()}
                        </Text>
                      </View>
                    </View>
                    {user._id !== item._id && (
                      <TouchableOpacity
                        className="rounded-[8px] w-[100px] flex-row justify-center items-center h-[35px] bg-[#ffffff15]"
                        onPress={() => handleFollowUnfollow(item)}>
                        <Text className="text-blue-50/50">
                          {item?.followers?.find(
                            (i: any) => i.userId === user._id,
                          )
                            ? 'Following'
                            : 'Follow'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                )}
              </>
            );
          }}
        />
      )}

      {active === 2 && (
        <Text className="text-[16px] text-center pt-3 text-blue-50/50">
          No Pending
        </Text>
      )}
    </SafeAreaView>
  );
};

export default FollowerCard;

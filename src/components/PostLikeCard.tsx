import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  useGetAllUsersQuery,
  useUpdateFollowUnfollowUserMutation,
} from '../../redux/features/users/userApi';

type Props = {
  route: any;
  navigation: any;
};

const PostLikeCard = ({navigation, route}: Props) => {
  const defaultAvatar =
    'https://res.cloudinary.com/dmffc94ez/image/upload/v1713702571/avatar_liey1j.png';
  const itemData = route.params.item;

  const {user} = useSelector((state: any) => state.auth);
  const [users, setUsers] = useState<any[]>([]);
  const [userFullData, setUserFullData] = useState<any>();

  const [data, setData] = useState<any[]>([]);

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
    setData(
      itemData.map((item: any) =>
        users.find((u: any) => u._id === item.userId),
      ),
    );
  }, [itemData, users]);

  console.log(data);

  return (
    <SafeAreaView className="bg-black flex-1">
      <View className="p-3">
        <View className="flex-row items-center mb-3">
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
          <Text className="pl-4 text-[23px] font-[600] text-blue-300">
            Likes
          </Text>
        </View>
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
                  user: userFullData,
                  followUserId: i._id,
                });
                refetch();
              } catch (error) {
                console.log(error, 'error');
              }
            };

            return (
              <TouchableOpacity
                className="w-full py-3 flex-row justify-between"
                onPress={() =>
                  item._id === user._id
                    ? navigation.navigate('Profile')
                    : navigation.navigate('UserProfile', {
                        item: users.find((i: any) =>
                          i._id === item._id ? i : null,
                        ),
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
                    <View className="relative flex-row items-center">
                      <Text className="text-[18px] text-blue-50/90">
                        {item?.name}
                      </Text>
                    </View>

                    <Text className="text-[15px] text-blue-50/70 italic">
                      {item?.userName?.toLowerCase()}
                    </Text>
                  </View>
                </View>
                {userFullData._id !== item?._id && (
                  <TouchableOpacity
                    className="rounded-[8px] w-[100px] flex-row justify-center items-center h-[35px] bg-[#ffffff15]"
                    onPress={() => handleFollowUnfollow(item)}>
                    <Text className="text-blue-50/50">
                      {userFullData?.following.find(
                        (i: any) => i.userId === item?._id,
                      )
                        ? 'Following'
                        : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default PostLikeCard;

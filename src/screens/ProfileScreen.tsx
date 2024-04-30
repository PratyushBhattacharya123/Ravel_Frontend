import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Dimensions} from 'react-native';
import {useLogOutQuery} from '../../redux/features/auth/authApi';
import {useGetAllUsersQuery} from '../../redux/features/users/userApi';
import PostCard from '../components/PostCard';
import {
  useGetAllPostsQuery,
  useUpdateLikeUnlikePostMutation,
} from '../../redux/features/posts/postApi';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
// import {loadUser, logoutUser} from '../../redux/actions/userAction';
// import PostCard from '../components/PostCard';

type Props = {
  navigation: any;
};

const {width} = Dimensions.get('window');

const ProfileScreen = ({navigation}: Props) => {
  const defaultAvatar =
    'https://res.cloudinary.com/dmffc94ez/image/upload/v1713702571/avatar_liey1j.png';
  const [
    updateLikeUnlikePost,
    {isSuccess: likeUnlikeSuccess, isLoading: likeUnlineLoading},
  ] = useUpdateLikeUnlikePostMutation();
  const tabBarHeight = useBottomTabBarHeight();
  const [active, setActive] = useState(0);
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
  const {user} = useSelector((state: any) => state.auth);
  const [avatar, setAvatar] = useState(defaultAvatar);

  const [logout, setLogout] = useState(false);
  const {} = useLogOutQuery(undefined, {
    skip: !logout ? true : false,
  });

  const {
    data: usersData,
    isLoading,
    isSuccess,
    refetch,
  } = useGetAllUsersQuery({}, {refetchOnMountOrArgChange: true});

  useEffect(() => {
    const tempUser = usersData?.users.filter(
      (item: any) => item.email === user.email,
    )[0];

    setUserFullData(tempUser);

    if (tempUser) {
      if (tempUser?.avatar?.url) {
        setAvatar(tempUser?.avatar?.url);
      }
    }
  }, [user, usersData]);

  const {
    data: postsData,
    isSuccess: postsSuccess,
    error: postsError,
    refetch: postsRefetch,
  } = useGetAllPostsQuery({}, {refetchOnMountOrArgChange: true});
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [repliesData, setRepliesData] = useState<any[]>([]);
  const logoutHandler = async () => {
    setLogout(true);
  };

  useEffect(() => {
    if (postsSuccess) {
      setAllPosts(postsData.posts);
    }
  }, [postsSuccess, postsData]);

  useEffect(() => {
    if (allPosts && userFullData) {
      const myPosts = allPosts.filter(
        (post: any) => post.user._id === userFullData._id,
      );
      setData(myPosts);
    }
  }, [allPosts, userFullData]);

  useEffect(() => {
    if (allPosts && userFullData) {
      const myReplies = allPosts.filter((post: any) =>
        post.replies.some((reply: any) => reply.user._id === userFullData._id),
      );
      setRepliesData(myReplies.filter((post: any) => post.replies.length > 0));
    }
  }, [allPosts, userFullData]);

  const likeUnlikeHandler = async (e: any) => {
    try {
      const userId = user._id;
      const post = allPosts?.find((p: any) => p._id === e._id);
      if (post.likes.length !== 0) {
        const isLikedBefore =
          post &&
          post.likes &&
          post.likes.find((p: any) => p.userId === userId);

        // Update Redux state immediately
        const updatedPosts = allPosts.map((postObj: any) =>
          postObj._id === e._id
            ? {
                ...postObj,
                likes: isLikedBefore
                  ? postObj.likes.filter((like: any) => like.userId !== userId)
                  : [...postObj.likes, {userId}],
              }
            : postObj,
        );

        setAllPosts(updatedPosts);
      } else {
        const updatedPosts = allPosts.map((postObj: any) =>
          postObj._id === e._id
            ? {
                ...postObj,
                likes: [...postObj.likes, {userId}],
              }
            : postObj,
        );

        setAllPosts(updatedPosts);
      }
      await updateLikeUnlikePost({
        user,
        postId: e._id,
      });
      refetch();
    } catch (error: any) {
      console.log(error, 'error');
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="bg-black flex-1"
      style={{marginBottom: tabBarHeight}}>
      <SafeAreaView className="relative mt-10 mx-3 font-sans">
        <View>
          <View className="flex-row justify-between">
            <View className="w-[30vw] flex items-center">
              <Image
                source={{uri: avatar}}
                height={100}
                width={100}
                borderRadius={100}
              />
            </View>
            <View className="flex-row items-center justify-center gap-10 mb-2 flex-1">
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('FollowerCard', {
                    item: userFullData,
                    followers: userFullData?.followers,
                    following: userFullData?.following,
                    activeNumber: 0,
                  })
                }>
                <View className="flex items-center">
                  <Text className="text-[25px] text-blue-50/70 font-semibold">
                    {userFullData?.followers.length}
                  </Text>
                  <Text className="text-[16px] text-blue-50/70">
                    {userFullData?.followers.length > 1
                      ? 'followers'
                      : 'follower'}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('FollowerCard', {
                    item: userFullData,
                    followers: userFullData?.followers,
                    following: userFullData?.following,
                    activeNumber: 1,
                  })
                }>
                <View className="flex items-center">
                  <Text className="text-[25px] text-blue-50/70 font-semibold">
                    {userFullData?.following.length}
                  </Text>
                  <Text className="text-[16px] text-blue-50/70">following</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex items-start mx-3">
            <View className="mt-4 flex-row justify-center items-center">
              <Text className="text-blue-50 text-[20px]">
                {userFullData?.name}
              </Text>
              {userFullData.role === 'Admin' && (
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/1828/1828640.png',
                  }}
                  width={18}
                  height={18}
                  className="ml-2 -mb-1"
                />
              )}
            </View>
            {userFullData?.userName && (
              <Text className="text-blue-50/50 text-[16px] italic mt-1">
                @{userFullData?.userName?.toLowerCase()}
              </Text>
            )}
          </View>
          <Text className="mx-3 text-blue-100/90 font-sans leading-6 text-[14px] text-justify mt-1">
            {userFullData?.bio}
          </Text>
          <View className={`mx-2 ${userFullData?.bio ? 'mt-0' : '-mt-4'}`}>
            <View className="py-3 flex-row w-full items-center justify-center gap-2">
              <TouchableOpacity
                onPress={() => navigation.navigate('EditProfile')}>
                <Text
                  className="w-[45vw] text-center pt-[6px] h-[35px] text-blue-50 text-[14px] font-semibold"
                  style={{
                    borderColor: '#ffffff30',
                    borderWidth: 1,
                    backgroundColor: '#ffffff10',
                    borderRadius: 5,
                  }}>
                  Edit Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="-mr-3" onPress={logoutHandler}>
                <Text
                  className="w-[43vw] text-center pt-[6px] h-[35px] text-blue-50 text-[14px] font-semibold"
                  style={{
                    borderColor: '#ffffff30',
                    borderWidth: 1,
                    backgroundColor: '#ffffff10',
                    borderRadius: 5,
                  }}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row items-center justify-center">
            <View className="py-3" style={{width: '90%'}}>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => setActive(0)}
                  className="flex items-center w-[50%]">
                  <Text
                    className="text-[18px] text-blue-100 pb-3"
                    style={{opacity: active === 0 ? 1 : 0.6}}>
                    Ravels {data?.length ? `(${data?.length})` : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActive(1)}
                  className="flex items-center w-[50%]">
                  <Text
                    className="text-[18px] text-blue-100 pb-3"
                    style={{opacity: active === 1 ? 1 : 0.6}}>
                    Replies{' '}
                    {repliesData?.length ? `(${repliesData?.length})` : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {active === 0 ? (
              <>
                <View className="w-[45%] absolute h-[1px] bg-blue-100 left-[20px] bottom-[12px]" />
                <View className="w-[45%] absolute h-[1px] bg-blue-50/50 right-[20px] bottom-[12px]" />
              </>
            ) : (
              <>
                <View className="w-[45%] absolute h-[1px] bg-blue-100 right-[20px] bottom-[12px]" />
                <View className="w-[45%] absolute h-[1px] bg-blue-50/50 left-[20px] bottom-[12px]" />
              </>
            )}
          </View>
        </View>
        {active === 0 && (
          <>
            {data &&
              data.map((item: any) => (
                <PostCard
                  navigation={navigation}
                  key={item._id}
                  item={item}
                  user={userFullData}
                  likeUnlikeHandler={likeUnlikeHandler}
                />
              ))}
          </>
        )}

        {active === 1 && (
          <>
            {repliesData &&
              repliesData.map((item: any) => (
                <PostCard
                  navigation={navigation}
                  key={item._id}
                  item={item}
                  replies={true}
                  user={userFullData}
                  likeUnlikeHandler={likeUnlikeHandler}
                />
              ))}
          </>
        )}

        {active === 0 && (
          <>
            {data.length === 0 && (
              <Text className="text-blue-50/50 text-[15px] mt-8 text-center">
                You have no posts yet!
              </Text>
            )}
          </>
        )}

        {active === 1 && (
          <>
            {repliesData.length === 0 && (
              <Text className="text-blue-50/50 text-[15px] mt-8 text-center">
                You have no replies yet!
              </Text>
            )}
          </>
        )}
      </SafeAreaView>
    </ScrollView>
  );
};

export default ProfileScreen;

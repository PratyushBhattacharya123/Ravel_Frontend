import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  useGetAllUsersQuery,
  useUpdateFollowUnfollowUserMutation,
} from '../../redux/features/users/userApi';
// import {
//   followUserAction,
//   unfollowUserAction,
// } from '../../redux/actions/userAction';
import PostCard from '../components/PostCard';
import {
  useGetAllPostsQuery,
  useUpdateLikeUnlikePostMutation,
} from '../../redux/features/posts/postApi';
import Loader from '../common/Loader';

type Props = {
  route: any;
  navigation: any;
};

const UserProfileScreen = ({navigation, route}: Props) => {
  const defaultAvatar =
    'https://res.cloudinary.com/dmffc94ez/image/upload/v1713702571/avatar_liey1j.png';

  const profileUser = route.params.item;

  const {user} = useSelector((state: any) => state.auth);
  const [profileUserFullData, setProfileUserFullData] = useState({
    _id: '',
    name: '',
    bio: '',
    role: '',
    userName: '',
    avatar: {url: ''},
    followers: [],
    following: [],
  });
  const [userFullData, setUserFullData] = useState<any>();
  const [
    updateFollowUnfollowUser,
    {isSuccess: followUnfollowSuccess, isLoading: followUnfollowLoading},
  ] = useUpdateFollowUnfollowUserMutation();
  const [imagePreview, setImagePreview] = useState(false);
  const [active, setActive] = useState(0);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [postsData, setPostsData] = useState<any[]>([]);
  const [repliesData, setRepliesData] = useState<any[]>([]);
  const itemData = route.params.item;
  const [data, setData] = useState(itemData);
  const [customLoading, setCustomLoading] = useState(true);
  const [avatar, setAvatar] = useState(defaultAvatar);

  const [
    updateLikeUnlikePost,
    {isSuccess: likeUnlikeSuccess, isLoading: likeUnlineLoading},
  ] = useUpdateLikeUnlikePostMutation();

  const {
    data: allPostsData,
    isSuccess: postsSuccess,
    error: postsError,
    refetch: postsRefetch,
  } = useGetAllPostsQuery({}, {refetchOnMountOrArgChange: true});

  const {
    data: allUsersData,
    isLoading,
    isSuccess,
    refetch,
  } = useGetAllUsersQuery({}, {refetchOnMountOrArgChange: true});

  useEffect(() => {
    const tempUser = allUsersData?.users.filter(
      (item: any) => item.email === user.email,
    )[0];

    setUserFullData(tempUser);

    if (tempUser) {
      if (tempUser?.avatar?.url) {
        setAvatar(tempUser?.avatar?.url);
      }
    }
  }, [allUsersData, user]);

  useEffect(() => {
    const tempUser = allUsersData?.users.filter(
      (item: any) => item.email === profileUser.email,
    )[0];

    setProfileUserFullData(tempUser);
    setCustomLoading(false);

    if (tempUser) {
      if (tempUser?.avatar?.url) {
        setAvatar(tempUser?.avatar?.url);
      }
    }
  }, [profileUser, allUsersData]);

  useEffect(() => {
    if (postsSuccess) {
      setAllPosts(allPostsData.posts);
    }
  }, [postsSuccess, allPostsData]);

  const FollowUnfollowHandler = async () => {
    try {
      const userId = userFullData._id;
      const followUserId = data._id;
      const isFollowedBefore =
        userFullData &&
        userFullData.following &&
        userFullData.following.find((d: any) => d.userId === followUserId);

      // Update Redux state immediately
      const updatedData: any = {
        ...data,
        followers: isFollowedBefore
          ? data.followers.filter((follower: any) => follower.userId !== userId)
          : [...data.followers, {userId}],
      };

      setData(updatedData);

      const tempUpdatedUserData: any = {
        ...userFullData,
        following: isFollowedBefore
          ? userFullData.following.filter(
              (following: any) => following.userId !== followUserId,
            )
          : [...userFullData.following, {userId: followUserId}],
      };

      setUserFullData(tempUpdatedUserData);
      console.log('UserFullData', userFullData);
      console.log('Data', data);

      await updateFollowUnfollowUser({
        user,
        followUserId: data._id,
      });
      refetch();
    } catch (error) {
      console.log(error, 'error');
    }
  };

  useEffect(() => {
    if (allPosts && profileUserFullData) {
      const myPosts = allPosts.filter(
        (post: any) => post.user._id === profileUserFullData._id,
      );
      setPostsData(myPosts);
    }
  }, [allPosts, profileUserFullData]);

  useEffect(() => {
    if (postsData && profileUserFullData) {
      const myReplies = postsData.filter((post: any) =>
        post.replies.some(
          (reply: any) => reply.user._id === profileUserFullData._id,
        ),
      );
      setRepliesData(myReplies.filter((post: any) => post.replies.length > 0));
    }
  }, [postsData, profileUserFullData]);

  const likeUnlikeHandler = async (e: any) => {
    try {
      const userId = user._id;
      const post = postsData?.find((p: any) => p._id === e._id);
      if (post.likes.length !== 0) {
        const isLikedBefore =
          post &&
          post.likes &&
          post.likes.find((p: any) => p.userId === userId);

        // Update Redux state immediately
        const updatedPosts = postsData.map((postObj: any) =>
          postObj._id === e._id
            ? {
                ...postObj,
                likes: isLikedBefore
                  ? postObj.likes.filter((like: any) => like.userId !== userId)
                  : [...postObj.likes, {userId}],
              }
            : postObj,
        );

        setPostsData(updatedPosts);
      } else {
        const updatedPosts = postsData.map((postObj: any) =>
          postObj._id === e._id
            ? {
                ...postObj,
                likes: [...postObj.likes, {userId}],
              }
            : postObj,
        );

        setPostsData(updatedPosts);
      }
      await updateLikeUnlikePost({
        user,
        postId: e._id,
      });
      postsRefetch();
    } catch (error: any) {
      console.log(error, 'error');
    }
  };

  return (
    <>
      {isLoading || customLoading ? (
        <Loader />
      ) : (
        <SafeAreaView className="relative pt-2 font-sans bg-black flex-1">
          {imagePreview ? (
            <TouchableOpacity
              className="h-screen w-full items-center justify-center"
              onPress={() => setImagePreview(!imagePreview)}>
              <Image
                source={{uri: data.avatar?.url}}
                width={250}
                height={250}
                borderRadius={500}
              />
            </TouchableOpacity>
          ) : (
            <View className="mb-10">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="h-10 w-10 bg-white/25 rounded-full flex items-center justify-center ml-2">
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/512/2223/2223615.png',
                  }}
                  height={25}
                  width={25}
                  tintColor={'#dbeafe'}
                />
              </TouchableOpacity>
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="mt-4 px-2">
                <View>
                  <View className="flex-row justify-between">
                    <View className="w-[30vw] flex items-center">
                      <TouchableOpacity onPress={() => setImagePreview(true)}>
                        <Image
                          source={{uri: avatar}}
                          height={100}
                          width={100}
                          borderRadius={100}
                        />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center justify-center gap-10 mb-2 flex-1">
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('FollowerCard', {
                            item: data,
                            followers: data?.followers,
                            following: data?.following,
                            activeNumber: 0,
                          })
                        }>
                        <View className="flex items-center">
                          <Text className="text-[25px] text-blue-50/70 font-semibold">
                            {data?.followers.length}
                          </Text>
                          <Text className="text-[16px] text-blue-50/70">
                            {data?.followers.length > 1
                              ? 'followers'
                              : 'follower'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('FollowerCard', {
                            item: data,
                            followers: data?.followers,
                            following: data?.following,
                            activeNumber: 1,
                          })
                        }>
                        <View className="flex items-center">
                          <Text className="text-[25px] text-blue-50/70 font-semibold">
                            {data?.following.length}
                          </Text>
                          <Text className="text-[16px] text-blue-50/70">
                            following
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View className="flex items-start mx-3">
                    <View className="mt-4 flex-row justify-center items-center">
                      <Text className="text-blue-50 text-[20px]">
                        {data?.name}
                      </Text>
                      {profileUserFullData?.role === 'Admin' && (
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
                    <Text className="text-blue-50/50 text-[16px] italic mt-1">
                      @{data?.userName?.toLowerCase()}
                    </Text>
                  </View>
                  <Text className="mx-3 text-blue-100/90 font-sans leading-6 text-[14px] text-justify mt-1">
                    {data?.bio}
                  </Text>
                  <View className={`mx-2 ${data?.bio ? 'mt-0' : '-mt-4'}`}>
                    <View className="py-3 flex-row w-full items-center justify-center">
                      <TouchableOpacity
                        className="w-[85vw]"
                        onPress={FollowUnfollowHandler}>
                        {userFullData?.following.find(
                          (i: any) => i.userId === data._id,
                        ) ? (
                          <View className="bg-slate-950/20 rounded-md">
                            <Text
                              className="text-center pt-[7px] h-[40px] text-blue-50 text-[16px] font-semibold"
                              style={{
                                borderColor: '#ffffff30',
                                borderWidth: 1,
                                backgroundColor: '#ffffff10',
                                borderRadius: 5,
                              }}>
                              Following
                            </Text>
                          </View>
                        ) : (
                          <View className="bg-blue-700 rounded-md">
                            <Text
                              className="text-center pt-[7px] h-[40px] text-blue-50 text-[16px] font-semibold"
                              style={{
                                borderColor: '#ffffff30',
                                borderWidth: 1,
                                backgroundColor: '#ffffff10',
                                borderRadius: 5,
                              }}>
                              Follow
                            </Text>
                          </View>
                        )}
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
                            Ravels
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setActive(1)}
                          className="flex items-center w-[50%]">
                          <Text
                            className="text-[18px] text-blue-100 pb-3"
                            style={{opacity: active === 1 ? 1 : 0.6}}>
                            Replies
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
                    {postsData &&
                      postsData.map((item: any) => (
                        <PostCard
                          user={profileUserFullData}
                          navigation={navigation}
                          key={item._id}
                          item={item}
                          likeUnlikeHandler={likeUnlikeHandler}
                        />
                      ))}
                    {postsData.length === 0 && (
                      <Text className="text-blue-50/50 text-[15px] mt-8 text-center">
                        No posts yet!
                      </Text>
                    )}
                  </>
                )}

                {active === 1 && (
                  <>
                    {repliesData &&
                      repliesData.map((item: any) => (
                        <PostCard
                          user={profileUserFullData}
                          navigation={navigation}
                          key={item._id}
                          item={item}
                          replies={true}
                          likeUnlikeHandler={likeUnlikeHandler}
                        />
                      ))}
                    {active !== 1 && postsData.length === 0 && (
                      <Text className="text-blue-50/50 text-[15px] mt-8 text-center">
                        No Post yet!
                      </Text>
                    )}
                  </>
                )}
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      )}
    </>
  );
};

export default UserProfileScreen;

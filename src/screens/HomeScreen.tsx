import {FlatList, Animated, Easing, RefreshControl, Text} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native';
import {useSelector} from 'react-redux';
import PostCard from '../components/PostCard';
import Loader from '../common/Loader';
import Lottie from 'lottie-react-native';
import {Platform} from 'react-native';
import {
  useGetAllPostsQuery,
  useUpdateLikeUnlikePostMutation,
} from '../../redux/features/posts/postApi';
import {useGetAllUsersQuery} from '../../redux/features/users/userApi';
import {View} from 'react-native';
import {StatusBar} from 'native-base';
import {Image} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
const loader = require('../assets/animation_lkbqh8co.json');

type Props = {
  navigation: any;
  route: any;
};

const HomeScreen = ({navigation, route}: Props) => {
  const tabBarHeight = useBottomTabBarHeight();
  const {data, isLoading, error, isSuccess, refetch} = useGetAllPostsQuery({});
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    isSuccess: usersSuccess,
    refetch: usersRefetch,
  } = useGetAllUsersQuery({});
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userFullData, setUserFullData] = useState({
    _id: '',
    name: '',
    userName: '',
    avatar: {url: ''},
    followers: [],
    following: [],
  });
  const {user} = useSelector((state: any) => state.auth);
  const [offsetY, setOffsetY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [extraPaddingTop] = useState(new Animated.Value(0));
  const refreshingHeight = 100;
  const lottieViewRef = useRef<Lottie>(null);
  const [
    updateLikeUnlikePost,
    {isSuccess: likeUnlikeSuccess, isLoading: likeUnlineLoading},
  ] = useUpdateLikeUnlikePostMutation();

  let progress = 0;
  if (offsetY < 0 && !isRefreshing) {
    const maxOffsetY = -refreshingHeight;
    progress = Math.min(offsetY / maxOffsetY, 1);
  }

  useEffect(() => {
    const tempUser = usersData?.users.filter(
      (item: any) => item.email === user.email,
    )[0];

    setUserFullData(tempUser);
  }, [user, usersData]);

  useEffect(() => {
    if (isSuccess) {
      setAllPosts(data.posts);
    }
    if (usersSuccess) {
      const tempUsers = usersData?.users.find(
        (item: any) => item.email !== user.email,
      );
      setAllUsers(tempUsers);
    }
  }, [isSuccess, data, user, usersSuccess, usersData]);

  function onScroll(event: any) {
    const {nativeEvent} = event;
    const {contentOffset} = nativeEvent;
    const {y} = contentOffset;
    setOffsetY(y);
  }

  function onRelease() {
    if (offsetY <= -refreshingHeight && !isRefreshing) {
      setIsRefreshing(true);
      setTimeout(() => {
        refetch();
        setIsRefreshing(false);
      }, 3000);
    }
  }

  function onScrollEndDrag(event: any) {
    const {nativeEvent} = event;
    const {contentOffset} = nativeEvent;
    const {y} = contentOffset;
    setOffsetY(y);

    if (y <= -refreshingHeight && !isRefreshing) {
      setIsRefreshing(true);
      setTimeout(() => {
        refetch();
        setIsRefreshing(false);
      }, 3000);
    }
  }

  useEffect(() => {
    if (isRefreshing) {
      Animated.timing(extraPaddingTop, {
        toValue: refreshingHeight,
        duration: 0,
        useNativeDriver: false,
      }).start();
      lottieViewRef.current?.play();
    } else {
      Animated.timing(extraPaddingTop, {
        toValue: 0,
        duration: 400,
        easing: Easing.elastic(1.3),
        useNativeDriver: false,
      }).start();
    }
  }, [isRefreshing, extraPaddingTop]);

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
        user: userFullData,
        postId: e._id,
      });
      refetch();
    } catch (error: any) {
      console.log(error, 'error');
    }
  };

  useEffect(() => {
    if (route?.params?.refetch) {
      console.log('Route refetch running');
      refetch();
    }
  }, [refetch, route]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <SafeAreaView className="bg-black flex-1">
          <StatusBar backgroundColor={'black'} />
          <Lottie
            ref={lottieViewRef}
            style={{
              height: refreshingHeight,
              display: isRefreshing ? 'flex' : 'none',
              position: 'absolute',
              top: 15,
              left: 0,
              right: 0,
            }}
            loop={false}
            source={loader}
            progress={progress}
          />
          {/* custom loader not working in android that's why I used here built in loader for android and custom loader for android but both working perfectly */}
          <View style={{marginBottom: tabBarHeight * 2}}>
            <View className="flex-row items-center justify-center border border-b-blue-50/20 pb-4">
              <View className="flex-row items-center justify-center pt-4 gap-[2px]">
                <Image
                  source={require('../assets/ravel_logo.png')}
                  width={100}
                  height={100}
                  className="object-cover w-[28px] h-[35px]"
                />
                <Text className="text-[28px] font-sans text-center text-blue-300 font-bold">
                  avel
                </Text>
              </View>
            </View>
            {Platform.OS === 'ios' ? (
              <FlatList
                data={allPosts}
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => (
                  <PostCard
                    navigation={navigation}
                    item={item}
                    user={userFullData}
                  />
                )}
                onScroll={onScroll}
                onScrollEndDrag={onScrollEndDrag}
                onResponderRelease={onRelease}
                ListHeaderComponent={
                  <Animated.View
                    style={{
                      paddingTop: extraPaddingTop,
                    }}
                  />
                }
              />
            ) : (
              <FlatList
                data={allPosts}
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => (
                  <PostCard
                    navigation={navigation}
                    item={item}
                    user={userFullData}
                    likeUnlikeHandler={likeUnlikeHandler}
                  />
                )}
                onScroll={onScroll}
                onScrollEndDrag={onScrollEndDrag}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      setRefreshing(true);
                      refetch();
                      usersRefetch().then(() => {
                        setRefreshing(false);
                      });
                    }}
                    progressViewOffset={refreshingHeight}
                  />
                }
                onResponderRelease={onRelease}
                ListHeaderComponent={
                  <Animated.View
                    style={{
                      paddingTop: extraPaddingTop,
                    }}
                  />
                }
              />
            )}
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

export default HomeScreen;

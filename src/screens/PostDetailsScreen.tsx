import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import PostDetailsCard from '../components/PostDetailsCard';
import {useSelector} from 'react-redux';
import {
  useGetAllPostsQuery,
  useUpdateLikeUnlikePostMutation,
  useUpdateLikeUnlikeRepliesMutation,
} from '../../redux/features/posts/postApi';
import {useGetAllUsersQuery} from '../../redux/features/users/userApi';

type Props = {
  navigation: any;
  route: any;
};

const PostDetailsScreen = ({navigation, route}: Props) => {
  const defaultAvatar =
    'https://res.cloudinary.com/dmffc94ez/image/upload/v1713702571/avatar_liey1j.png';
  let item = route.params.data;
  const [
    updateLikeUnlikePost,
    {isSuccess: likeUnlikeSuccess, isLoading: likeUnlineLoading},
  ] = useUpdateLikeUnlikePostMutation();
  const [
    updateLikeUnlikeReplies,
    {isSuccess: likeUnlikeSuccessReplies, isLoading: likeUnlineLoadingReplies},
  ] = useUpdateLikeUnlikeRepliesMutation();
  const {user} = useSelector((state: any) => state.auth);
  const [userFullData, setUserFullData] = useState<any>();
  const {
    data: allUsersData,
    isLoading,
    isSuccess,
    refetch,
  } = useGetAllUsersQuery({}, {refetchOnMountOrArgChange: true});
  const [posts, setPosts] = useState<any[]>([]);
  const {
    data: allPosts,
    isSuccess: postsSuccess,
    error: postsError,
    refetch: postsRefetch,
  } = useGetAllPostsQuery({}, {refetchOnMountOrArgChange: true});

  const [data, setData] = useState(item);

  useEffect(() => {
    const tempUser = allUsersData?.users.filter(
      (item: any) => item.email === user.email,
    )[0];

    setUserFullData(tempUser);
  }, [allUsersData, user]);

  useEffect(() => {
    if (postsSuccess) {
      setPosts(allPosts.posts);
    }
  }, [postsSuccess, allPosts]);

  useEffect(() => {
    if (posts) {
      const d = posts.find((i: any) => i._id === item._id);
      setData(d);
    }
  }, [posts, item]);

  const likeUnlikeHandler = async (e: any) => {
    try {
      const userId = user._id;
      const post = posts?.find((p: any) => p._id === e._id);
      if (post.likes.length !== 0) {
        const isLikedBefore =
          post &&
          post.likes &&
          post.likes.find((p: any) => p.userId === userId);

        // Update Redux state immediately
        const updatedPosts = posts.map((postObj: any) =>
          postObj._id === e._id
            ? {
                ...postObj,
                likes: isLikedBefore
                  ? postObj.likes.filter((like: any) => like.userId !== userId)
                  : [...postObj.likes, {userId}],
              }
            : postObj,
        );

        setPosts(updatedPosts);
      } else {
        const updatedPosts = posts.map((postObj: any) =>
          postObj._id === e._id
            ? {
                ...postObj,
                likes: [...postObj.likes, {userId}],
              }
            : postObj,
        );

        setPosts(updatedPosts);
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

  const repliesLikeUnlikeHandler = async (pos: any, reply: any) => {
    try {
      const userId = user._id;
      const currentPost = posts?.find((p: any) => p._id === pos._id);
      const allReplies = currentPost?.replies;
      const replyData = allReplies?.find((r: any) => r._id === reply._id);

      if (replyData.likes.length !== 0) {
        const isLikedBefore =
          replyData &&
          replyData.likes &&
          replyData.likes.find((p: any) => p.userId === userId);

        // Update Redux state immediately
        const updatedReply = {
          ...replyData,
          likes: isLikedBefore
            ? replyData.likes.filter((like: any) => like.userId !== userId)
            : [...replyData.likes, {userId}],
        };

        const updatedAllreplies = allReplies.map((r: any) => {
          return r._id === replyData._id ? updatedReply : r;
        });

        const updatedPost = {
          ...data,
          replies: updatedAllreplies,
        };

        setData(updatedPost);

        const updatedAllPosts = posts.map((p: any) => {
          return p._id === pos._id ? updatedPost : p;
        });

        setPosts(updatedAllPosts);
      } else {
        const updatedReply = {
          ...replyData,
          likes: [...replyData.likes, {userId}],
        };

        const updatedAllreplies = allReplies.map((r: any) => {
          return r._id === replyData._id ? updatedReply : r;
        });

        const updatedPost = {
          ...data,
          replies: updatedAllreplies,
        };

        setData(updatedPost);

        const updatedAllPosts = posts.map((p: any) => {
          return p._id === pos._id ? updatedPost : p;
        });

        setPosts(updatedAllPosts);
      }
      await updateLikeUnlikeReplies({
        user: userFullData,
        postId: pos._id,
        replyId: reply._id,
        replyTitle: replyData?.title,
      });
      refetch();
    } catch (error: any) {
      console.log(error, 'error');
    }
  };

  return (
    <SafeAreaView>
      <View className="relative flex-col justify-between bg-black">
        <View className="h-[102%]">
          <View className="my-3">
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
          </View>
          <ScrollView showsVerticalScrollIndicator={false} className="mb-32">
            <PostDetailsCard
              navigation={navigation}
              item={data}
              post={data}
              user={userFullData}
              likeUnlikeHandler={likeUnlikeHandler}
              postHandler={true}
            />
            <View>
              {data?.replies?.map((i: any, index: number) => {
                return (
                  <PostDetailsCard
                    navigation={navigation}
                    item={i}
                    key={index}
                    isReply={true}
                    post={item}
                    user={userFullData}
                    repliesLikeUnlikeHandler={repliesLikeUnlikeHandler}
                  />
                );
              })}
            </View>
          </ScrollView>
        </View>
        <View className="absolute bottom-8 flex-row w-full justify-center bg-black h-[70px] items-center">
          <TouchableOpacity
            className="w-[92%] bg-blue-50/10 h-[45px] rounded-[40px] flex-row items-center"
            onPress={() =>
              navigation.replace('CreateReplies', {
                item: item,
                navigation: navigation,
              })
            }>
            <Image
              source={{
                uri:
                  item?.user?.avatar?.url ||
                  userFullData?.avatar?.url ||
                  defaultAvatar,
              }}
              width={30}
              height={30}
              borderRadius={100}
              className="ml-3 mr-3"
            />
            <Text className="text-[16px] text-blue-50/50">
              Reply to {item.user.name}{' '}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PostDetailsScreen;

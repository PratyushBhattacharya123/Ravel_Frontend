import {View, Text, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Image} from 'react-native';
import getTimeDuration from '../common/TimeGenerator';
// import {
//   addLikes,
//   addLikesToRepliesReply,
//   addLikesToReply,
//   removeLikes,
//   removeLikesFromRepliesReply,
//   removeLikesFromReply,
// } from '../../redux/actions/postAction';
import axios from 'axios';
import {URI} from '../../redux/URI';
import {useGetAllUsersQuery} from '../../redux/features/users/userApi';
import {
  useGetAllPostsQuery,
  useUpdateLikeUnlikeRepliesReplyMutation,
} from '../../redux/features/posts/postApi';

type Props = {
  navigation: any;
  item: any;
  isReply?: boolean | null;
  post: any;
  isRepliesReply?: boolean;
  user: any;
  repliesLikeUnlikeHandler?: any;
  likeUnlikeHandler?: any;
  postHandler?: boolean;
  replies?: any;
};

const PostDetailsCard = ({
  item,
  isReply,
  navigation,
  post,
  isRepliesReply,
  user,
  repliesLikeUnlikeHandler,
  likeUnlikeHandler,
  postHandler,
  replies,
}: Props) => {
  const defaultAvatar =
    'https://res.cloudinary.com/dmffc94ez/image/upload/v1713702571/avatar_liey1j.png';
  const {
    data,
    isLoading,
    isSuccess,
    error,
    refetch: usersRefetch,
  } = useGetAllUsersQuery({});
  const [
    updateLikeUnlikeRepliesReply,
    {isSuccess: likeUnlikeSuccess, isLoading: likeUnlineLoading},
  ] = useUpdateLikeUnlikeRepliesReplyMutation();
  const [users, setUsers] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [postRepliesData, setPostRepliesData] = useState(null);
  const [postData, setPostData] = useState<any>();
  const [itemData, setItemData] = useState<any>();
  const {
    data: postsData,
    isSuccess: postsSuccess,
    error: postsError,
    refetch,
  } = useGetAllPostsQuery({}, {refetchOnMountOrArgChange: true});
  const [active, setActive] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    userName: '',
    avatar: {
      url: 'https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png',
    },
  });

  const time = item?.createdAt;
  const formattedDuration = getTimeDuration(time);

  const profileHandler = async (e: any) => {
    await axios.get(`${URI}/get-user/${e._id}`).then(res => {
      if (res.data.user._id !== user._id) {
        navigation.navigate('UserProfile', {
          item: res.data.user,
        });
      } else {
        navigation.navigate('Profile');
      }
    });
  };

  const handlePress = async (e: any) => {
    setActive(!active);
    setPostRepliesData(e);
  };

  const repliesReplyLikeUnlikeHandler = async (reply: any) => {
    try {
      const userId = user._id;
      const postId = post._id;
      const replyId = replies._id;
      const singleReplyId = reply._id;
      const currentPost = post;
      const allReplies = currentPost?.replies;
      const replyData = replies;
      const allReply = replies.reply;
      const currentReplyData = allReply?.find((r: any) => r._id === reply._id);

      if (currentReplyData.likes.length !== 0) {
        const isLikedBefore =
          currentReplyData &&
          currentReplyData.likes &&
          currentReplyData.likes.find((p: any) => p.userId === userId);

        // Update Redux state immediately
        const updatedRepliesReply = {
          ...currentReplyData,
          likes: isLikedBefore
            ? currentReplyData.likes.filter(
                (like: any) => like.userId !== userId,
              )
            : [...currentReplyData.likes, {userId}],
        };

        const updatedReply = allReply.map((r: any) => {
          return r._id === currentReplyData._id ? updatedRepliesReply : r;
        });

        setItemData(updatedReply);

        const updatedAllreplies = allReplies.map((r: any) => {
          return r._id === replyData._id ? updatedReply : r;
        });

        const updatedPost = {
          ...postData,
          replies: updatedAllreplies,
        };

        setPostData(updatedPost);

        const updatedAllPosts = allPosts.map((p: any) => {
          return p._id === postId ? updatedPost : p;
        });

        setAllPosts(updatedAllPosts);
      } else {
        const updatedRepliesReply = {
          ...currentReplyData,
          likes: [...currentReplyData.likes, {userId}],
        };

        const updatedReply = allReply.map((r: any) => {
          return r._id === currentReplyData._id ? updatedRepliesReply : r;
        });

        setItemData(updatedReply);

        const updatedAllreplies = allReplies.map((r: any) => {
          return r._id === replyData._id ? updatedReply : r;
        });

        const updatedPost = {
          ...postData,
          replies: updatedAllreplies,
        };

        setPostData(updatedPost);

        const updatedAllPosts = allPosts.map((p: any) => {
          return p._id === postId ? updatedPost : p;
        });

        setAllPosts(updatedAllPosts);
      }
      await updateLikeUnlikeRepliesReply({
        user: userInfo,
        postId,
        replyId,
        replyTitle: currentReplyData?.title,
        singleReplyId,
      });
      refetch();
    } catch (error: any) {
      console.log(error, 'error');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setUsers(data?.users);
    }
    if (users) {
      const userData = users.find((u: any) => u?._id === item?.user?._id);
      setUserInfo(userData);
    }
    if (postsSuccess) {
      setAllPosts(postsData.posts);
    }
    if (post) {
      setPostData(post);
    }
    if (replies) {
      setItemData(replies);
    }
  }, [users, isSuccess, item, data, postsSuccess, postsData, post, replies]);

  return (
    <View
      className={`p-[15px] pb-2 ${!isReply && 'border-b-blue-50/20 border-b'}`}
      style={{left: isReply ? 20 : 0, width: isReply ? '95%' : '100%'}}>
      <View className="relative">
        <View className="flex-row w-full justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => profileHandler(userInfo)}>
              <Image
                source={{uri: userInfo?.avatar?.url || defaultAvatar}}
                width={40}
                height={40}
                borderRadius={100}
              />
            </TouchableOpacity>
            <View className="pl-3">
              <TouchableOpacity onPress={() => profileHandler(userInfo)}>
                <View className="relative flex-row items-center">
                  <Text className="text-blue-50/90 font-[500] text-[16px]">
                    {userInfo?.name}
                  </Text>
                  {item?.role === 'Admin' && (
                    <Image
                      source={{
                        uri: 'https://cdn-icons-png.flaticon.com/128/1828/1828640.png',
                      }}
                      width={15}
                      height={15}
                      className="ml-1 absolute bottom-0 left-0"
                    />
                  )}
                </View>
                {userInfo?.userName && (
                  <Text className="text-[13px] text-blue-50/50 italic">
                    @{userInfo?.userName?.toLowerCase()}
                  </Text>
                )}
              </TouchableOpacity>
              <Text className="text-blue-50/80 font-[500] text-[13px] mt-[2px]">
                {item?.title}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Text className="text-blue-50/50">{formattedDuration}</Text>
            <TouchableOpacity>
              <Text className="text-blue-50/80 pl-4 font-[700] mb-[15px] -mr-[14px] rotate-90">
                ...
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {item?.image && (
          <View className="my-3">
            {item?.image && (
              <Image
                source={{uri: item?.image?.url}}
                style={{aspectRatio: 1, borderRadius: 10, zIndex: 1111}}
                resizeMode="contain"
              />
            )}
          </View>
        )}

        {!item?.image && (
          <View className="absolute top-[52px] left-5 h-[50%] w-[1px] bg-blue-50/30" />
        )}

        <View
          className={`flex-row items-center top-[5px] ${
            !item?.image && 'left-[50px]'
          }`}>
          <TouchableOpacity
            onPress={() =>
              postHandler
                ? likeUnlikeHandler(post)
                : isRepliesReply
                ? repliesReplyLikeUnlikeHandler(item)
                : repliesLikeUnlikeHandler(post, item)
            }>
            {item?.likes?.length > 0 ? (
              <>
                {item?.likes?.find((i: any) => i?.userId === user?._id) ? (
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/2589/2589175.png',
                    }}
                    width={30}
                    height={30}
                  />
                ) : (
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/2589/2589197.png',
                    }}
                    width={30}
                    height={30}
                    tintColor={'#dbeafe70'}
                  />
                )}
              </>
            ) : (
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/2589/2589197.png',
                }}
                width={30}
                height={30}
                tintColor={'#dbeafe70'}
              />
            )}
          </TouchableOpacity>
          {!isRepliesReply && (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('CreateReplies', {
                  item: item,
                  navigation: navigation,
                  postId: post?._id,
                });
              }}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/5948/5948565.png',
                }}
                width={22}
                height={22}
                className="ml-5"
                tintColor={'#dbeafe70'}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3905/3905866.png',
              }}
              width={25}
              height={25}
              className="ml-5"
              tintColor={'#dbeafe70'}
            />
          </TouchableOpacity>
          <TouchableOpacity className="rotate-6">
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/10863/10863770.png',
              }}
              width={25}
              height={25}
              className="ml-4"
              tintColor={'#dbeafe70'}
            />
          </TouchableOpacity>
        </View>

        <View className={`pt-4 flex-row ${!item?.image && 'pl-[50px]'}`}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PostDetails', {
                data: item,
              })
            }></TouchableOpacity>
          <Text className="text-[16px[ text-blue-50/50">
            {item?.likes?.length} {item?.likes?.length > 1 ? 'likes' : 'like'}
          </Text>
        </View>
      </View>
      {item?.reply && (
        <>
          {item?.reply?.length !== 0 && (
            <>
              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => handlePress(item)}>
                  <Text
                    className={`text-blue-50/90 text-[14px] ${
                      !item?.image && 'ml-[50px]'
                    }`}>
                    {active ? 'Hide Replies' : 'View Replies'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="ml-[10px] mt-[20px] text-black text-[16px]">
                    {item?.likes?.length}{' '}
                    {item?.likes?.length > 1 ? 'likes' : 'like'}
                  </Text>
                </TouchableOpacity>
              </View>
              {active && (
                <>
                  {item?.reply.map((i: any) => (
                    <PostDetailsCard
                      navigation={navigation}
                      item={i}
                      key={i._id}
                      isReply={true}
                      post={postData}
                      isRepliesReply={true}
                      user={user}
                      replies={itemData}
                      repliesLikeUnlikeHandler={repliesReplyLikeUnlikeHandler}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
};

export default PostDetailsCard;

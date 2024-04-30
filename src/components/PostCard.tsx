import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Image} from 'react-native';
import getTimeDuration from '../common/TimeGenerator';
import axios from 'axios';
import {URI} from '../../redux/URI';
import PostDetailsCard from './PostDetailsCard';
import {useGetAllUsersQuery} from '../../redux/features/users/userApi';
import {
  useDeletePostMutation,
  useGetAllPostsQuery,
  useUpdateLikeUnlikeRepliesMutation,
} from '../../redux/features/posts/postApi';

type Props = {
  navigation: any;
  item: any;
  user: any;
  likeUnlikeHandler?: any;
  isReply?: boolean | null;
  postId?: string | null;
  replies?: boolean | null;
};

const PostCard = ({
  item,
  isReply,
  navigation,
  postId,
  replies,
  user,
  likeUnlikeHandler,
}: Props) => {
  const defaultAvatar =
    'https://res.cloudinary.com/dmffc94ez/image/upload/v1713702571/avatar_liey1j.png';
  const {data, isLoading, isSuccess, error, refetch} = useGetAllUsersQuery({});
  const [users, setUsers] = useState<any[]>([]);
  const [post, setPost] = useState<any>();
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const {
    data: postsData,
    isSuccess: postsSuccess,
    error: postsError,
    refetch: postsRefetch,
  } = useGetAllPostsQuery({}, {refetchOnMountOrArgChange: true});
  const [
    updateLikeUnlikeReplies,
    {isSuccess: likeUnlikeSuccess, isLoading: likeUnlineLoading},
  ] = useUpdateLikeUnlikeRepliesMutation();
  const [deletePost, {isLoading: deleteLoading, isSuccess: deleteSuccess}] =
    useDeletePostMutation();
  const [openModal, setOpenModal] = useState(false);
  const [userInfo, setUserInfo] = useState({
    _id: '',
    name: '',
    userName: '',
    avatar: {
      url: 'https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png',
    },
    role: '',
  });
  const time = item?.createdAt;
  const formattedDuration = getTimeDuration(time);

  useEffect(() => {
    if (deleteSuccess) {
      console.log('success');
      postsRefetch();
      setOpenModal(false);
    }
  }, [deleteSuccess, postsRefetch]);

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

  const deletePostHandler = async (e: any) => {
    await deletePost(e);
  };

  useEffect(() => {
    if (isSuccess) {
      setUsers(data?.users);
    }
    if (users) {
      const userData = users.find((u: any) => u._id === item.user._id);
      setUserInfo(userData);
    }
    if (postsSuccess) {
      setAllPosts(postsData.posts);
    }
  }, [users, isSuccess, item, data, postsSuccess, postsData]);

  useEffect(() => {
    if (item) {
      setPost(item);
    }
  }, [item]);

  const repliesLikeUnlikeHandler = async (pos: any, reply: any) => {
    try {
      const userId = user._id;
      const currentPost = allPosts?.find((p: any) => p._id === pos._id);
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
          ...post,
          replies: updatedAllreplies,
        };

        setPost(updatedPost);

        const updatedAllPosts = allPosts.map((p: any) => {
          return p._id === pos._id ? updatedPost : p;
        });

        setAllPosts(updatedAllPosts);
      } else {
        const updatedReply = {
          ...replyData,
          likes: [...replyData.likes, {userId}],
        };

        const updatedAllreplies = allReplies.map((r: any) => {
          return r._id === replyData._id ? updatedReply : r;
        });

        const updatedPost = {
          ...post,
          replies: updatedAllreplies,
        };

        setPost(updatedPost);

        const updatedAllPosts = allPosts.map((p: any) => {
          return p._id === pos._id ? updatedPost : p;
        });

        setAllPosts(updatedAllPosts);
      }
      await updateLikeUnlikeReplies({
        user: userInfo,
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
    <View className="p-[15px] border-b border-b-blue-50/30">
      <View className="relative">
        <View className="flex-row w-full">
          <View className="flex-row w-[85%] items-center">
            <TouchableOpacity onPress={() => profileHandler(item.user)}>
              <Image
                source={{uri: userInfo?.avatar?.url || defaultAvatar}}
                width={40}
                height={40}
                borderRadius={100}
              />
            </TouchableOpacity>
            <View className="pl-3 w-[70%] mb-[6px]">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => profileHandler(userInfo)}>
                <Text className="text-blue-50/90 font-[500] text-[16px]">
                  {userInfo?.name}
                </Text>
                {userInfo?.role === 'Admin' && (
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/1828/1828640.png',
                    }}
                    width={15}
                    height={15}
                    className="ml-1"
                  />
                )}
              </TouchableOpacity>
              <Text className="text-blue-50/70 font-[500] text-[14px] mt-1">
                {item.title}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Text
              className={`text-blue-50/70 ${
                item?.user?._id !== user?._id && 'ml-9'
              }`}>
              {formattedDuration}
            </Text>
            {item?.user._id === user?._id && (
              <TouchableOpacity
                onPress={() =>
                  item?.user._id === user?._id && setOpenModal(!openModal)
                }>
                <Text className="text-blue-50/80 font-bold pl-4 ml-[14px] mb-[14px] text-[24px] rotate-90">
                  ...
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {item.image && (
          <View className="my-3">
            {item.image && (
              <Image
                source={{uri: item?.image?.url}}
                style={{aspectRatio: 1, borderRadius: 10, zIndex: 1111}}
                resizeMode="contain"
              />
            )}
          </View>
        )}

        {!item.image && (
          <View className="absolute top-[52px] left-5 h-[55%] w-[1px] bg-blue-50/30" />
        )}

        <View
          className={`flex-row items-center top-[5px] ${
            !item.image && 'left-[50px]'
          }`}>
          <TouchableOpacity onPress={() => likeUnlikeHandler(item)}>
            {item?.likes?.length > 0 ? (
              <>
                {item.likes.find((i: any) => i.userId === user._id) ? (
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
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('CreateReplies', {
                item: item,
                navigation: navigation,
                postId: postId,
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

        {!isReply && (
          <View className={`pt-4 flex-row ${!item.image && 'pl-[50px]'}`}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('PostDetails', {
                  data: item,
                })
              }>
              <Text className="text-blue-50/50">
                {item?.replies?.length !== 0 &&
                  `${item?.replies?.length} ${
                    item?.replies?.length > 1 ? 'replies' : 'reply'
                  }  •`}
                {'  '}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                item.likes.length !== 0 &&
                navigation.navigate('PostLikeCard', {
                  item: item.likes,
                  navigation: navigation,
                })
              }>
              <Text className="text-[16px[ text-blue-50/50">
                {item.likes.length} {item.likes.length > 1 ? 'likes' : 'like'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {replies && (
          <>
            {post?.replies?.map((i: any) => (
              <PostDetailsCard
                navigation={navigation}
                key={i._id}
                item={i}
                isReply={true}
                post={post}
                user={user}
                replies={i}
                repliesLikeUnlikeHandler={repliesLikeUnlikeHandler}
              />
            ))}
          </>
        )}
        {openModal && (
          <View className="flex-[1] justify-center items-center">
            <Modal
              animationType="fade"
              transparent={true}
              visible={openModal}
              onRequestClose={() => {
                setOpenModal(!openModal);
              }}>
              <TouchableWithoutFeedback onPress={() => setOpenModal(false)}>
                <View className="flex-[1] justify-end">
                  <TouchableWithoutFeedback
                    onPress={() => setOpenModal(true)}
                    disabled={deleteLoading}>
                    <View className="w-full bg-slate-900 h-[140] rounded-tl-[20px] rounded-tr-[20px] p-[20px] items-center shadow-[#000] shadow-inner pt-8">
                      <TouchableOpacity
                        className={`w-full h-[50px] rounded-[10px] items-center justify-center flex-row ${
                          deleteLoading ? 'bg-red-500/70' : 'bg-red-500'
                        }`}
                        onPress={() => deletePostHandler(item._id)}>
                        <Text className="text-[18px] font-[600] text-white">
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
        )}
      </View>
    </View>
  );
};

export default PostCard;

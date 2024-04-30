import {
  View,
  Text,
  SafeAreaView,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import getTimeDuration from '../common/TimeGenerator';
import axios from 'axios';
import {URI} from '../../redux/URI';
import {
  useAddRepliesMutation,
  useAddRepliesReplyMutation,
  useGetAllPostsQuery,
} from '../../redux/features/posts/postApi';
import {useGetAllUsersQuery} from '../../redux/features/users/userApi';
// import { getAllPosts } from '../../redux/actions/postAction';

type Props = {
  navigation: any;
  route: any;
};

const CreateRepliesScreen = ({navigation, route}: Props) => {
  const defaultAvatar =
    'https://res.cloudinary.com/dmffc94ez/image/upload/v1713702571/avatar_liey1j.png';

  const post = route.params.item;
  const postId = route.params.postId;
  const {user} = useSelector((state: any) => state.auth);
  const [image, setImage] = useState('');
  const [title, setTitle] = useState('');
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const {
    data: postsData,
    isSuccess: postsSuccess,
    error: postsError,
    refetch: postsRefetch,
  } = useGetAllPostsQuery({}, {refetchOnMountOrArgChange: true});

  const [addReplies, {isLoading, isSuccess, data}] = useAddRepliesMutation();

  const [
    addRepliesReply,
    {
      isLoading: repliesReplyLoading,
      isSuccess: repliesReplySuccess,
      data: repliesReplyData,
    },
  ] = useAddRepliesReplyMutation();

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

  const {
    data: usersData,
    isLoading: usersLoading,
    isSuccess: usersSuccess,
    refetch,
  } = useGetAllUsersQuery({}, {refetchOnMountOrArgChange: true});

  useEffect(() => {
    const tempUser = usersData?.users.filter(
      (item: any) => item.email === user.email,
    )[0];

    setUserFullData(tempUser);
  }, [user, usersData]);

  const ImageUpload = async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.8,
      includeBase64: true,
    }).then((image: ImageOrVideo | null) => {
      if (image) {
        // @ts-ignore
        setImage('data:image/jpeg;base64,' + image.data);
      }
    });
  };

  useEffect(() => {
    if (isSuccess) {
      setImage('');
      setTitle('');
      postsRefetch();
      navigation.navigate('PostDetails', {
        data: data.post,
        navigation: navigation,
      });
    }
    if (repliesReplySuccess) {
      setImage('');
      setTitle('');
      postsRefetch();
      navigation.navigate('PostDetails', {
        data: repliesReplyData.post,
        navigation: navigation,
      });
    }
  }, [
    isSuccess,
    data,
    navigation,
    postsRefetch,
    repliesReplySuccess,
    repliesReplyData,
  ]);

  const time = post.createdAt;
  const formattedDuration = getTimeDuration(time);

  const checker = postId ? true : false;

  const createRepliesHandler = async () => {
    if (!checker && user && post && (image || title)) {
      await addReplies({user: userFullData, postId: post._id, image, title});
    } else {
      await addRepliesReply({
        user: userFullData,
        postId: post._id,
        replyId: postId,
        image,
        title,
      });
    }
  };

  useEffect(() => {
    if (postsSuccess) {
      setAllPosts(postsData.posts);
    }
  }, [postsSuccess, postsData]);
  return (
    <SafeAreaView className="bg-black flex-1">
      <View className="flex-row items-center p-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="h-10 w-10 bg-white/25 rounded-full flex items-center justify-center">
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/2223/2223615.png',
            }}
            height={25}
            width={25}
            tintColor={'#dbeafe'}
          />
        </TouchableOpacity>
        <Text className="text-[28px] left-4 font-[600] text-blue-300">
          Reply
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative h-[88vh] flex-col">
          <View className="flex-row w-full justify-between p-3">
            <View className="flex-row items-center">
              <Image
                source={{uri: post.user.avatar.url || defaultAvatar}}
                width={40}
                height={40}
                borderRadius={100}
              />
              <View className="pl-3">
                <Text className="text-blue-50/90 font-[500] text-[18px]">
                  {post.user.name}
                </Text>
                <Text className="text-blue-50/70 font-[500] text-[16px]">
                  {post.title}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Text className="text-blue-50/50">{formattedDuration}</Text>
              <TouchableOpacity>
                <Text className="text-blue-50/90 rotate-90 pl-4 font-[700] mb-[15px] ml-3">
                  ...
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            className={`flex items-center ${
              post.image ? 'my-3 mb-6' : 'mb-2'
            }`}>
            {post.image && (
              <Image
                source={{uri: post.image.url}}
                style={{
                  width: '85%',
                  aspectRatio: 1,
                  borderRadius: 10,
                  zIndex: 1111,
                }}
                resizeMode="contain"
              />
            )}
          </View>
          {!post.image && (
            <View className="absolute top-16 left-5 h-[40%] w-[1px] bg-blue-50/20" />
          )}

          <View className="ml-[30px]">
            <View className="flex-row">
              <Image
                source={{uri: user.avatar.url}}
                width={40}
                height={40}
                borderRadius={100}
              />
              <View className="pl-3">
                <Text className="text-blue-50/80 font-[500] text-[18px]">
                  {user.name}
                </Text>
                <TextInput
                  placeholder={`Reply to ${post.user.name}...`}
                  placeholderTextColor={'#666'}
                  className="mt-[-7px] -ml-[2px] text-blue-50/80"
                  value={title}
                  onChangeText={setTitle}
                />
                <TouchableOpacity
                  className="-mt-2 -ml-[2px]"
                  onPress={ImageUpload}>
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/10857/10857463.png',
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      marginLeft: 5,
                    }}
                    tintColor={'#dbeafe90'}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View>
              {image && (
                <View className="relative">
                  <TouchableOpacity
                    className="absolute right-10 top-4 z-[1000000] w-[27px] h-[27px] bg-black/70 flex items-center justify-center rounded-full"
                    onPress={() => {
                      setImage('');
                    }}>
                    <Image
                      source={{
                        uri: 'https://cdn-icons-png.flaticon.com/512/2961/2961937.png',
                      }}
                      style={{
                        width: 15,
                        height: 12,
                        tintColor: '#dbeafe',
                      }}
                    />
                  </TouchableOpacity>
                  <Image
                    source={{uri: image}}
                    style={{
                      width: '78%',
                      aspectRatio: 1,
                      borderRadius: 10,
                      zIndex: 1111,
                      marginLeft: 50,
                      marginVertical: 10,
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      <View className="p-2 flex-row justify-between items-center mx-2">
        <Text className="text-blue-100 px-1 py-1 text-[15px]">
          Anyone can reply
        </Text>
        <TouchableOpacity
          onPress={createRepliesHandler}
          disabled={isLoading || repliesReplyLoading}>
          <Text
            className={`text-blue-500 font-semibold text-[15px] ${
              (isLoading || repliesReplyLoading) && 'opacity-50'
            }`}>
            Post
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CreateRepliesScreen;

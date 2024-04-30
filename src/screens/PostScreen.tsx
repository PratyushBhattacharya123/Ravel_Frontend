import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import {useCreatePostMutation} from '../../redux/features/posts/postApi';

interface IReply {
  title: string;
  image: string;
  user: any;
}

const PostScreen = ({navigation}: any) => {
  const defaultAvatar =
    'https://res.cloudinary.com/dmffc94ez/image/upload/v1713702571/avatar_liey1j.png';

  const {user} = useSelector((state: any) => state.auth);
  const [activeIndex, setActiveIndex] = useState(0);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');

  const [replies, setReplies] = useState<IReply[]>([]);

  const screenWidth = Dimensions.get('window').width;
  const imageWidth = screenWidth * 0.9;

  const [createPost, {isLoading, error, isSuccess}] = useCreatePostMutation();

  useEffect(() => {
    if (isSuccess) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Post Added Successfully', ToastAndroid.LONG);
      } else {
        Alert.alert('Post Added Successfully');
      }
      setTitle('');
      setImage('');
      setReplies([]);
      setActiveIndex(0);
      navigation.navigate('Home', {
        refetch: true,
      });
    }
    if (error) {
      if ('data' in error) {
        const errorData = error as any;
        if (Platform.OS === 'android') {
          ToastAndroid.show(errorData.data.message, ToastAndroid.LONG);
        } else {
          Alert.alert(errorData.data.message);
        }
      }
    }
  }, [isSuccess, error, navigation]);

  const handleTitleChange = (index: number, text: string) => {
    setReplies(prevPost => {
      const updatedPost = [...prevPost];
      updatedPost[index] = {...updatedPost[index], title: text};
      return updatedPost;
    });
  };

  const uploadImage = (index: number) => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.9,
      includeBase64: true,
    }).then((image: ImageOrVideo | null) => {
      if (image) {
        setReplies(prevPost => {
          const updatedPost = [...prevPost];
          updatedPost[index] = {
            ...updatedPost[index],
            // @ts-ignore
            image: 'data:image/jpeg;base64,' + image?.data,
          };
          return updatedPost;
        });
      }
    });
  };

  const deleteImage = (index: number) => {
    setReplies(prevPost => {
      const updatedPost = [...prevPost];
      updatedPost[index] = {
        ...updatedPost[index],
        image: '',
      };
      return updatedPost;
    });
  };

  const addNewThread = () => {
    if (
      replies[activeIndex].title !== '' ||
      replies[activeIndex].image !== ''
    ) {
      setReplies(prevPost => [...prevPost, {title: '', image: '', user}]);
      setActiveIndex(replies.length);
    }
  };

  const removeThread = (index: number) => {
    if (replies.length > 0) {
      if (replies.length === 1 && index === 0) {
        setReplies([]);
        setActiveIndex(replies.length - 1);
        // setRepliesShow(false);
      }
      const updatedPost = [...replies];
      updatedPost.splice(index, 1);
      setReplies(updatedPost);
      replies[replies.length - 1]
        ? setActiveIndex(replies.length - 2)
        : setActiveIndex(replies.length - 1);
    } else {
      setReplies([]);
    }
  };

  const removePostData = () => {
    setTitle('');
    setImage('');
  };

  const postImageUpload = () => {
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

  const repliesShowHandler = () => {
    setReplies([{title: '', image: '', user}]);
    setActiveIndex(0);
  };

  const createPostHandler = async () => {
    if (title !== '' || image !== '') {
      let updatedReplies: IReply[] = [];
      replies.map((reply: any) => {
        if (reply.title !== '' || reply.image !== '') {
          updatedReplies.push(reply);
        }
      });
      const data = {
        title,
        image,
        user,
        replies: updatedReplies,
      };
      console.log(data);
      await createPost(data);
    }
  };

  return (
    <SafeAreaView className="flex-1 font-sans bg-black">
      {/* Header */}
      <View className="w-full flex justify-between flex-row items-center my-3">
        <Image
          source={require('../assets/ravel_logo.png')}
          style={{
            width: 16,
            height: 20,
            tintColor: '#dbeafe',
          }}
          className="ml-4"
        />
        <Text className="text-[20px] font-semibold text-blue-200 text-center">
          New Ravel
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/2961/2961937.png',
            }}
            style={{
              width: 15,
              height: 15,
              tintColor: '#dbeafe',
            }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="m-3 flex-[1] justify-between">
          <View className="mt-2">
            <View className="flex-row items-center justify-between mx-1">
              <View className="flex-row items-center gap-3">
                <Image
                  source={{uri: user?.avatar?.url || defaultAvatar}}
                  style={{width: 40, height: 40}}
                  borderRadius={100}
                />
                <Text className="text-[20px] font-normal text-blue-50/90">
                  {user.name}
                </Text>
              </View>
              {(title || image) && (
                <TouchableOpacity onPress={removePostData}>
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/484/484611.png',
                    }}
                    style={{
                      width: 20,
                      height: 20,
                    }}
                    tintColor={'#dbeafe80'}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View className="mx-3">
              <TextInput
                placeholder="Start a ravel..."
                placeholderTextColor={'#dbeafe70'}
                value={title}
                onChangeText={text => setTitle(text)}
                className="mt-1 text-[#dbeafe] text-[16px]"
              />
              <TouchableOpacity onPress={postImageUpload}>
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/512/10857/10857463.png',
                  }}
                  style={{
                    width: 25,
                    height: 25,
                    marginLeft: 5,
                  }}
                  tintColor={'#dbeafe90'}
                />
              </TouchableOpacity>
            </View>
            {image && (
              <View className="mx-2 mt-4 mb-6 relative">
                <TouchableOpacity
                  className="absolute right-2 top-2 z-[1000] w-[27px] h-[27px] bg-black/70 flex items-center justify-center rounded-full"
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
                  resizeMethod="auto"
                  alt=""
                  width={imageWidth}
                  height={imageWidth}
                />
              </View>
            )}
            <View className="mt-4" />
            {replies.length === 0 && (title !== '' || image !== '') && (
              <TouchableOpacity
                className="flex-row mx-3 w-full items-center"
                onPress={repliesShowHandler}>
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/512/992/992651.png',
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    marginLeft: 5,
                  }}
                  tintColor={'#dbeafe90'}
                />
                <Text className="pl-[10px] text-blue-50/50">
                  Add to ravel...
                </Text>
              </TouchableOpacity>
            )}
            {/* {repliesShow && */}
            {replies.map((item: any, index: number) => (
              <View key={index}>
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mx-1">
                    <View className="flex-row items-center gap-3">
                      <Image
                        source={{
                          uri: item?.user?.avatar?.url || defaultAvatar,
                        }}
                        style={{width: 40, height: 40}}
                        borderRadius={100}
                      />
                      <Text className="text-[20px] font-normal text-blue-50/90">
                        {item?.user.name}
                      </Text>
                    </View>
                    {replies.length > 0 && (
                      <TouchableOpacity onPress={() => removeThread(index)}>
                        <Image
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/484/484611.png',
                          }}
                          style={{
                            width: 20,
                            height: 20,
                          }}
                          tintColor={'#dbeafe80'}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View className="mx-3">
                    <TextInput
                      placeholder="Start a ravel..."
                      placeholderTextColor={'#dbeafe70'}
                      value={item.title}
                      onChangeText={text => handleTitleChange(index, text)}
                      className="mt-1 text-[#dbeafe] text-[16px]"
                    />
                    <TouchableOpacity onPress={() => uploadImage(index)}>
                      <Image
                        source={{
                          uri: 'https://cdn-icons-png.flaticon.com/512/10857/10857463.png',
                        }}
                        style={{
                          width: 25,
                          height: 25,
                          marginLeft: 5,
                        }}
                        tintColor={'#dbeafe90'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {item.image && (
                  <View className="mx-2 mb-6 relative">
                    <TouchableOpacity
                      className="absolute right-2 top-2 z-[1000] w-[27px] h-[27px] bg-black/70 flex items-center justify-center rounded-full"
                      onPress={() => deleteImage(index)}>
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
                      source={{uri: item.image}}
                      resizeMethod="auto"
                      alt=""
                      width={imageWidth}
                      height={imageWidth}
                    />
                  </View>
                )}
              </View>
            ))}
            {replies.length > 0 &&
              (replies[replies.length - 1].title !== '' ||
                replies[replies.length - 1].image !== '') && (
                <TouchableOpacity
                  className="flex-row mx-3 w-full items-center"
                  onPress={addNewThread}>
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/992/992651.png',
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      marginLeft: 5,
                    }}
                    tintColor={'#dbeafe90'}
                  />
                  <Text className="pl-[10px] text-blue-50/50">
                    Add to ravel...
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        </View>
      </ScrollView>

      <View className="p-2 flex-row justify-between items-center mx-2">
        <Text className="text-blue-100 px-1 py-1 text-[15px]">
          Anyone can reply
        </Text>
        <TouchableOpacity onPress={createPostHandler} disabled={isLoading}>
          <Text
            className={`text-blue-500 font-semibold text-[15px] ${
              isLoading ? 'opacity-50' : ''
            }`}>
            Post
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PostScreen;

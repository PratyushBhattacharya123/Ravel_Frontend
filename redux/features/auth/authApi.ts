import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiSlice} from '../api/apiSlice';
import {userLoggedIn, userLoggedOut, userRegistration} from './authSlice';

type RegistrationResponse = {
  message: string;
  token: string;
};

type RegistrationData = {
  name: string;
  email: string;
  password: string;
  avatar: string;
};

export const authApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // endpoints here
    // mutation - post, put, delete
    // query - get
    register: builder.mutation<RegistrationResponse, RegistrationData>({
      query: ({name, email, password, avatar}) => ({
        url: 'registration',
        method: 'POST',
        body: {name, email, password, avatar},
        credentials: 'include' as const,
      }),
      async onQueryStarted(arg, {queryFulfilled, dispatch}) {
        try {
          const result = await queryFulfilled;
          await AsyncStorage.setItem('token', result.data.token);
          dispatch(userRegistration({token: result.data.token}));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    login: builder.mutation({
      query: ({email, password}) => ({
        url: 'login',
        method: 'POST',
        body: {
          email,
          password,
        },
        credentials: 'include' as const,
      }),
      async onQueryStarted(arg, {queryFulfilled, dispatch}) {
        const result = await queryFulfilled;
        try {
          await AsyncStorage.setItem('token', result.data.token);
          dispatch(
            userLoggedIn({
              token: result.data.token,
              user: result.data.user,
            }),
          );
        } catch (error) {
          console.log(error);
        }
      },
    }),
    logOut: builder.query({
      query: () => ({
        url: 'logout',
        method: 'GET',
        credentials: 'include' as const,
      }),
      async onQueryStarted(arg, {dispatch}) {
        try {
          await AsyncStorage.setItem('token', '');
          dispatch(userLoggedOut());
        } catch (error) {
          console.log(error);
        }
      },
    }),
  }),
});

export const {useRegisterMutation, useLoginMutation, useLogOutQuery} = authApi;

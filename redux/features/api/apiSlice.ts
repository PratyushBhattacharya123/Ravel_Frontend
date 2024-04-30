import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {userLoggedIn} from '../auth/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URI} from '../../URI';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: URI,
  }),
  endpoints: builder => ({
    loadUser: builder.query({
      query: data => ({
        url: 'me',
        method: 'GET',
        credentials: 'include' as const,
      }),
      async onQueryStarted(arg, {queryFulfilled, dispatch}) {
        try {
          const result = await queryFulfilled;
          const token =
            (await AsyncStorage.getItem('token')) || result.data.token;
          dispatch(
            userLoggedIn({
              token,
              user: result.data.user,
            }),
          );
        } catch (error: any) {
          console.log(error);
        }
      },
    }),
  }),
});

export const {useLoadUserQuery} = apiSlice;

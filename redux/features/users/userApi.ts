import {apiSlice} from '../api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAllUsers: builder.query({
      query: () => ({
        url: 'users',
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    getUserDetails: builder.query({
      query: id => ({
        url: `get-user/${id}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    getUserAllNotifications: builder.query({
      query: userId => ({
        url: `get-notifications/${userId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    updateFollowUnfollowUser: builder.mutation({
      query: ({user, followUserId}) => ({
        url: 'add-user',
        method: 'PUT',
        body: {user, followUserId},
        credentials: 'include' as const,
      }),
    }),
    updateUserAvatar: builder.mutation({
      query: ({user, avatar}) => ({
        url: 'update-avatar',
        method: 'PUT',
        body: {user, avatar},
        credentials: 'include' as const,
      }),
    }),
    updateUserInfo: builder.mutation({
      query: ({user, name, userName, bio}) => ({
        url: 'update-profile',
        method: 'PUT',
        body: {user, name, userName, bio},
        credentials: 'include' as const,
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useUpdateFollowUnfollowUserMutation,
  useGetUserAllNotificationsQuery,
  useGetUserDetailsQuery,
  useUpdateUserInfoMutation,
  useUpdateUserAvatarMutation,
} = userApi;

import {apiSlice} from '../api/apiSlice';

export const postApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createPost: builder.mutation({
      query: data => ({
        url: 'create-post',
        method: 'POST',
        body: data,
        credentials: 'include' as const,
      }),
    }),
    getAllPosts: builder.query({
      query: () => ({
        url: 'posts',
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    updateLikeUnlikePost: builder.mutation({
      query: ({user, postId}) => ({
        url: 'update-likes',
        method: 'PUT',
        body: {user, postId},
        credentials: 'include' as const,
      }),
    }),
    updateLikeUnlikeReplies: builder.mutation({
      query: ({user, postId, replyId, replyTitle}) => ({
        url: 'update-replies-react',
        method: 'PUT',
        body: {user, postId, replyId, replyTitle},
        credentials: 'include' as const,
      }),
    }),
    addReplies: builder.mutation({
      query: ({user, postId, image, title}) => ({
        url: 'add-replies',
        method: 'PUT',
        body: {user, postId, image, title},
        credentials: 'include' as const,
      }),
    }),
    updateLikeUnlikeRepliesReply: builder.mutation({
      query: ({user, postId, replyId, replyTitle, singleReplyId}) => ({
        url: 'update-reply-react',
        method: 'PUT',
        body: {user, postId, replyId, replyTitle, singleReplyId},
        credentials: 'include' as const,
      }),
    }),
    addRepliesReply: builder.mutation({
      query: ({user, postId, replyId, image, title}) => ({
        url: 'add-reply',
        method: 'PUT',
        body: {user, postId, replyId, image, title},
        credentials: 'include' as const,
      }),
    }),
    deletePost: builder.mutation({
      query: id => ({
        url: `delete-post/${id}`,
        method: 'DELETE',
        credentials: 'include' as const,
      }),
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetAllPostsQuery,
  useUpdateLikeUnlikePostMutation,
  useUpdateLikeUnlikeRepliesMutation,
  useAddRepliesMutation,
  useAddRepliesReplyMutation,
  useUpdateLikeUnlikeRepliesReplyMutation,
  useDeletePostMutation,
} = postApi;

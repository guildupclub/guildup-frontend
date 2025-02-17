import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../config/constants';

export interface Post {
  _id: string;
  // add additional post properties as needed
}

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const initialState: PostsState = {
  posts: [],
  isLoading: false,
  error: null,
  page: 1,
  hasMore: true,
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (body: any, thunkAPI) => {
    console.log("@body",body)
    const res = await fetch(`${API_BASE_URL}/v1/post/getPosts`,
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
        page: body.page,
        userId: body.userId
        })
    })

    if (!res.ok) {
      return thunkAPI.rejectWithValue('Failed to fetch posts.');
    }
    // Expecting response structure: { posts: Post[], hasMore: boolean }
    const data = await res.json();
    return data.data;
  }
);

// New thunk to fetch posts for selected topics via category/post endpoint
export const getSelectedTopic = createAsyncThunk(
    'posts/getSelectedTopic',
    async (body: { userId: string, categoryIds: string[] }, thunkAPI) => {
      const res = await fetch("http://localhost:8000/v1/category/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: body.userId,
          categoryIds: body.categoryIds
        })
      });
      if (!res.ok) {
        return thunkAPI.rejectWithValue('Failed to fetch selected topic posts.');
      }
      // Assuming response contains posts in data.posts
      const data = await res.json();
      return data.data;
    }
  );

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    resetPosts(state) {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<{ posts: Post[]; hasMore: boolean }>) => {
        console.log("@action", action);
        state.isLoading = false;
        // Filter out duplicate posts based on _id.
        const uniqueNewPosts = action.payload.posts.filter(newPost =>
          !state.posts.some(existingPost => existingPost._id === newPost._id)
        );
        // Append only unique posts
        state.posts = state.posts.concat(uniqueNewPosts);
        if (!action.payload.posts.length) {
          state.hasMore = false;
        }else{
            state.hasMore = true
        }
        state.page = state.page + 1;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Something went wrong';
      })

      .addCase(getSelectedTopic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSelectedTopic.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.isLoading = false;
        // Replace posts with posts returned from the selected topic request.
        state.posts = action.payload;
        // Optionally reset pagination since this is based on filter.
        state.page = 1;

        if(!action.payload.length){
            state.hasMore = false   
        }else{  
            state.hasMore = true
        }
      })
      .addCase(getSelectedTopic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Something went wrong';
      });
  }
});

export const { resetPosts } = postsSlice.actions;
export default postsSlice.reducer;
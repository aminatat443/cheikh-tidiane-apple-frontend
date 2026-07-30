import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';

export const login = createAsyncThunk('auth/login', async (payload) => {
  const res = await authService.login(payload);
  localStorage.setItem('token', res.data.token);
  return res.data.user;
});

export const register = createAsyncThunk('auth/register', async (payload) => {
  const res = await authService.register(payload);
  localStorage.setItem('token', res.data.token);
  return res.data.user;
});

export const fetchMe = createAsyncThunk('auth/me', async () => {
  const res = await authService.me();
  return res.data.user;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      localStorage.removeItem('token');
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });

    [login, register].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.user = action.payload;
          state.isAuthenticated = true;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        });
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

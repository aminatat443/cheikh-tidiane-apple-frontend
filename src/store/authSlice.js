import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';

const twoFactorPayload = (d) => ({
  twoFactorRequired: !!d.twoFactorRequired,
  twoFactorSetupRequired: !!d.twoFactorSetupRequired,
  tempToken: d.tempToken,
});

/**
 * Enregistre la session et, si un AUTRE utilisateur s'était connecté sur cet
 * appareil, vide panier + favoris (chaque utilisateur repart de ses propres ajouts).
 */
function persistUserSession(res, thunkAPI) {
  localStorage.setItem('token', res.data.token);
  const uid = String(res.data.user.id);
  const prev = localStorage.getItem('lastUserId');
  if (prev && prev !== uid) {
    thunkAPI.dispatch({ type: 'auth/resetUserData' });
  }
  localStorage.setItem('lastUserId', uid);
  return { user: res.data.user };
}

export const login = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  const res = await authService.login(payload);
  // 2FA (vérification ou enrôlement obligatoire) : pas de jeton final.
  if (res.data?.twoFactorRequired || res.data?.twoFactorSetupRequired) {
    return twoFactorPayload(res.data);
  }
  return persistUserSession(res, thunkAPI);
});

export const enrollVerifyTwoFactor = createAsyncThunk('auth/enrollVerify2fa', async (payload, thunkAPI) => {
  const res = await authService.enrollVerify2fa(payload); // { tempToken, code }
  return persistUserSession(res, thunkAPI);
});

export const register = createAsyncThunk('auth/register', async (payload, thunkAPI) => {
  const res = await authService.register(payload);
  return persistUserSession(res, thunkAPI);
});

export const googleLogin = createAsyncThunk('auth/google', async (credential, thunkAPI) => {
  const res = await authService.google(credential);
  if (res.data?.twoFactorRequired || res.data?.twoFactorSetupRequired) {
    return twoFactorPayload(res.data);
  }
  return persistUserSession(res, thunkAPI);
});

export const verifyTwoFactor = createAsyncThunk('auth/verify2fa', async (payload, thunkAPI) => {
  const res = await authService.verify2fa(payload); // { tempToken, code }
  return persistUserSession(res, thunkAPI);
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
    twoFactor: { required: false, tempToken: null },
  },
  reducers: {
    logout(state) {
      localStorage.removeItem('token');
      state.user = null;
      state.isAuthenticated = false;
      state.twoFactor = { required: false, tempToken: null };
    },
    clearTwoFactor(state) {
      state.twoFactor = { required: false, tempToken: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        if (action.payload?.id) localStorage.setItem('lastUserId', String(action.payload.id));
      })
      .addCase(fetchMe.rejected, (state) => {
        localStorage.removeItem('token');
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'failed';
      });

    // Connexion (mot de passe ou Google, avec branche 2FA)
    const onAuthFulfilled = (state, action) => {
      if (action.payload.twoFactorRequired || action.payload.twoFactorSetupRequired) {
        state.status = 'twofa';
        state.twoFactor = {
          required: !!action.payload.twoFactorRequired,
          setup: !!action.payload.twoFactorSetupRequired,
          tempToken: action.payload.tempToken,
        };
      } else {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.twoFactor = { required: false, tempToken: null };
      }
    };
    [login, googleLogin].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunk.fulfilled, onAuthFulfilled)
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        });
    });

    // Vérification 2FA (code) + enrôlement 2FA (1re connexion)
    [verifyTwoFactor, enrollVerifyTwoFactor].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.twoFactor = { required: false, tempToken: null };
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        });
    });

    // Inscription
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { logout, clearTwoFactor } = authSlice.actions;
export default authSlice.reducer;

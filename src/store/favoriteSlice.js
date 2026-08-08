import { createSlice } from '@reduxjs/toolkit';

const persisted = JSON.parse(localStorage.getItem('favorites') || '[]');

function persist(items) {
  localStorage.setItem('favorites', JSON.stringify(items));
}

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState: { items: persisted },
  reducers: {
    toggleFavorite(state, action) {
      const product = action.payload;
      const exists = state.items.find((p) => p.id === product.id);
      if (exists) state.items = state.items.filter((p) => p.id !== product.id);
      else state.items.push(product);
      persist(state.items);
    },
    setFavorites(state, action) {
      state.items = action.payload;
      persist(state.items);
    },
  },
  // Réinitialise à la déconnexion ou au changement d'utilisateur (voir cartSlice).
  extraReducers: (builder) => {
    const reset = (state) => { state.items = []; persist([]); };
    builder.addCase('auth/logout', reset);
    builder.addCase('auth/resetUserData', reset);
  },
});

export const { toggleFavorite, setFavorites } = favoriteSlice.actions;
export const selectIsFavorite = (id) => (state) =>
  state.favorites.items.some((p) => p.id === id);
export const selectFavoriteCount = (state) => state.favorites.items.length;

export default favoriteSlice.reducer;

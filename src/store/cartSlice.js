import { createSlice } from '@reduxjs/toolkit';

/**
 * Panier local (persisté en localStorage). Synchronisable avec le backend
 * quand l'utilisateur est connecté.
 */
const persisted = JSON.parse(localStorage.getItem('cart') || '[]');

function persist(items) {
  localStorage.setItem('cart', JSON.stringify(items));
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: persisted },
  reducers: {
    addItem(state, action) {
      const { product, quantity = 1, color, storage, condition, price } = action.payload;
      const existing = state.items.find(
        (i) =>
          i.product.id === product.id &&
          i.color === color &&
          i.storage === storage &&
          i.condition === condition
      );
      if (existing) existing.quantity += quantity;
      else state.items.push({ product, quantity, color, storage, condition, price: price ?? product.price });
      persist(state.items);
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.product.id === id);
      if (item) item.quantity = Math.max(1, quantity);
      persist(state.items);
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.product.id !== action.payload);
      persist(state.items);
    },
    clearCart(state) {
      state.items = [];
      persist(state.items);
    },
  },
  // Réinitialise à la déconnexion ou quand un AUTRE utilisateur se connecte
  // (évite qu'un nouvel utilisateur hérite du panier du précédent sur le même appareil).
  extraReducers: (builder) => {
    const reset = (state) => { state.items = []; persist([]); };
    builder.addCase('auth/logout', reset);
    builder.addCase('auth/resetUserData', reset);
  },
});

export const { addItem, updateQuantity, removeItem, clearCart } = cartSlice.actions;

export const selectCartCount = (state) =>
  state.cart.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + (i.price ?? i.product.price) * i.quantity, 0);

export default cartSlice.reducer;

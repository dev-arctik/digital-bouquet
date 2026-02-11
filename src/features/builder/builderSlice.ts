// Builder slice — manages the 3-step wizard state.
// This slice is NOT persisted; it resets on page refresh.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  BuilderState,
  FlowerType,
  PlacedFlower,
  Note,
  GreeneryType,
  Bouquet,
  CartFlower,
} from '../../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MAX_FLOWERS,
  DEFAULT_NOTE_POSITION,
} from '../../data/flowers';

// Pick a random greenery type (excluding 'none') so bouquets look nice by default
const greeneryTypes: GreeneryType[] = ['bush', 'monstera', 'sprigs'];
const pickRandomGreenery = (): GreeneryType =>
  greeneryTypes[Math.floor(Math.random() * greeneryTypes.length)] ?? 'bush';

const initialState: BuilderState = {
  step: 1,
  cart: [],
  placedFlowers: [],
  note: null,
  greenery: pickRandomGreenery(),
  editingBouquetId: null,
  canvasWidth: CANVAS_WIDTH,
  canvasHeight: CANVAS_HEIGHT,
};

// Helper to count total flowers across all cart items
const getTotalCartCount = (cart: CartFlower[]): number =>
  cart.reduce((sum, item) => sum + item.count, 0);

const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<1 | 2 | 3>) {
      state.step = action.payload;
    },

    // Add a flower type to the cart (max MAX_FLOWERS total)
    addToCart(state, action: PayloadAction<FlowerType>) {
      if (getTotalCartCount(state.cart) >= MAX_FLOWERS) return;

      const existing = state.cart.find((item) => item.type === action.payload);
      if (existing) {
        existing.count += 1;
      } else {
        state.cart.push({ type: action.payload, count: 1 });
      }
    },

    // Increment a specific flower type in the cart (+1, respects max)
    incrementCartItem(state, action: PayloadAction<FlowerType>) {
      if (getTotalCartCount(state.cart) >= MAX_FLOWERS) return;

      const existing = state.cart.find((item) => item.type === action.payload);
      if (existing) {
        existing.count += 1;
      }
    },

    // Decrement a specific flower type (-1, removes entry at 0)
    decrementCartItem(state, action: PayloadAction<FlowerType>) {
      const existing = state.cart.find((item) => item.type === action.payload);
      if (!existing) return;

      existing.count -= 1;
      if (existing.count <= 0) {
        state.cart = state.cart.filter((item) => item.type !== action.payload);
      }
    },

    // Replace all placed flowers (used by PlacementEngine on step 2 entry)
    setPlacedFlowers(state, action: PayloadAction<PlacedFlower[]>) {
      state.placedFlowers = action.payload;
    },

    // Update a single flower's canvas position after drag
    updateFlowerPosition(
      state,
      action: PayloadAction<{ id: string; x: number; y: number }>
    ) {
      const flower = state.placedFlowers.find(
        (f) => f.id === action.payload.id
      );
      if (flower) {
        flower.x = action.payload.x;
        flower.y = action.payload.y;
      }
    },

    // Swap z-index with the flower one layer above (bring forward)
    bringToFront(state, action: PayloadAction<string>) {
      const flower = state.placedFlowers.find((f) => f.id === action.payload);
      if (!flower) return;

      // Find the flower with the next-higher z-index
      const above = state.placedFlowers
        .filter((f) => f.zIndex > flower.zIndex)
        .sort((a, b) => a.zIndex - b.zIndex)[0];

      if (above) {
        const temp = flower.zIndex;
        flower.zIndex = above.zIndex;
        above.zIndex = temp;
      }
    },

    // Swap z-index with the flower one layer below (send backward)
    sendToBack(state, action: PayloadAction<string>) {
      const flower = state.placedFlowers.find((f) => f.id === action.payload);
      if (!flower) return;

      // Find the flower with the next-lower z-index
      const below = state.placedFlowers
        .filter((f) => f.zIndex < flower.zIndex)
        .sort((a, b) => b.zIndex - a.zIndex)[0];

      if (below) {
        const temp = flower.zIndex;
        flower.zIndex = below.zIndex;
        below.zIndex = temp;
      }
    },

    // Set or clear the note
    setNote(state, action: PayloadAction<Note | null>) {
      state.note = action.payload;
    },

    // Update note position after drag
    updateNotePosition(
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) {
      if (state.note) {
        state.note.x = action.payload.x;
        state.note.y = action.payload.y;
      }
    },

    // Set the greenery background type
    setGreenery(state, action: PayloadAction<GreeneryType>) {
      state.greenery = action.payload;
    },

    // Track which garden bouquet is being edited (null = creating new)
    setEditingBouquetId(state, action: PayloadAction<string | null>) {
      state.editingBouquetId = action.payload;
    },

    // Load an existing bouquet into the builder for editing.
    // Populates cart (derived from flowers), placedFlowers, note, greenery.
    loadBouquetForEditing(state, action: PayloadAction<Bouquet>) {
      const bouquet = action.payload;

      state.editingBouquetId = bouquet.id;
      state.placedFlowers = bouquet.flowers;
      state.note = bouquet.note;
      state.greenery = bouquet.greenery;
      state.canvasWidth = bouquet.canvasWidth;
      state.canvasHeight = bouquet.canvasHeight;
      state.step = 2;

      // Derive cart from placed flowers by counting each type
      const cartMap = new Map<FlowerType, number>();
      for (const flower of bouquet.flowers) {
        cartMap.set(flower.type, (cartMap.get(flower.type) ?? 0) + 1);
      }
      state.cart = Array.from(cartMap.entries()).map(([type, count]) => ({
        type,
        count,
      }));
    },

    // Full reset to initial state (new bouquet) with a fresh random greenery
    resetBuilder() {
      return { ...initialState, greenery: pickRandomGreenery() };
    },

    // Go back to step 1: reset placedFlowers, keep cart + note text
    // Note position resets to default on re-entry to step 2
    goBackToStep1(state) {
      state.step = 1;
      state.placedFlowers = [];

      // Preserve note text and font but reset position to default
      if (state.note) {
        state.note.x = DEFAULT_NOTE_POSITION.x;
        state.note.y = DEFAULT_NOTE_POSITION.y;
      }
    },
  },
});

export const {
  setStep,
  addToCart,
  incrementCartItem,
  decrementCartItem,
  setPlacedFlowers,
  updateFlowerPosition,
  bringToFront,
  sendToBack,
  setNote,
  updateNotePosition,
  setGreenery,
  setEditingBouquetId,
  loadBouquetForEditing,
  resetBuilder,
  goBackToStep1,
} = builderSlice.actions;

export default builderSlice.reducer;

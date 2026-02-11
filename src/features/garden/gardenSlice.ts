// Garden slice — manages saved bouquets in localStorage.
// Persisted via redux-persist so bouquets survive browser sessions.

import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { GardenState, Bouquet } from '../../types';
import type { AppRootState } from '../../app/store';

const initialState: GardenState = {
  bouquets: [],
};

const gardenSlice = createSlice({
  name: 'garden',
  initialState,
  reducers: {
    // Save or update a bouquet.
    // If a bouquet with the same id already exists, replace it but keep the original createdAt.
    // Otherwise push as new.
    saveBouquet(state, action: PayloadAction<Bouquet>) {
      const incoming = action.payload;
      const existingIndex = state.bouquets.findIndex(
        (b) => b.id === incoming.id
      );

      if (existingIndex !== -1) {
        // Preserve original creation date when updating an edited bouquet
        const originalCreatedAt = state.bouquets[existingIndex]?.createdAt;
        state.bouquets[existingIndex] = {
          ...incoming,
          createdAt: originalCreatedAt ?? incoming.createdAt,
        };
      } else {
        state.bouquets.push(incoming);
      }
    },

    // Remove a bouquet by id
    deleteBouquet(state, action: PayloadAction<string>) {
      state.bouquets = state.bouquets.filter((b) => b.id !== action.payload);
    },
  },
});

export const { saveBouquet, deleteBouquet } = gardenSlice.actions;

// -- Selectors --

// All bouquets sorted newest-first by createdAt (memoized to avoid new array on every render)
export const selectAllBouquets = createSelector(
  (state: AppRootState) => state.garden.bouquets,
  (bouquets) =>
    [...bouquets].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
);

// Whether the garden is empty (used to conditionally show "My Collection" button)
export const selectGardenIsEmpty = (state: AppRootState): boolean =>
  state.garden.bouquets.length === 0;

// Find a specific bouquet by id
export const selectBouquetById =
  (id: string) =>
  (state: AppRootState): Bouquet | undefined =>
    state.garden.bouquets.find((b) => b.id === id);

export default gardenSlice.reducer;

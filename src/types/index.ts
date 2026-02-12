// All shared TypeScript types for Digital Bouquet.
// This is the single source of truth for data shapes across the app.

// The 9 available flower types in the catalog
export type FlowerType =
  | 'rose'
  | 'tulip'
  | 'sunflower'
  | 'lily'
  | 'daisy'
  | 'peony'
  | 'orchid'
  | 'carnation'
  | 'dahlia';

// Flower catalog entry — maps a flower type to its display name and asset
export interface FlowerMeta {
  type: FlowerType;
  name: string;
  asset: string;
}

// A flower type + quantity in the step 1 cart
export interface CartFlower {
  type: FlowerType;
  count: number;
}

// A single flower instance placed on the canvas (step 2+)
export interface PlacedFlower {
  id: string;
  type: FlowerType;
  x: number;
  y: number;
  zIndex: number;
}

// The note card attached to a bouquet (optional)
export interface Note {
  text: string;
  fontFamily: string;
  x: number;
  y: number;
}

// Greenery background options for the canvas
export type GreeneryType = 'bush' | 'monstera' | 'sprigs' | 'none';

// Greenery catalog entry
export interface GreeneryMeta {
  type: GreeneryType;
  name: string;
  asset: string | null;
}

// A complete saved bouquet (garden + sharing)
export interface Bouquet {
  id: string;
  flowers: PlacedFlower[];
  note: Note | null;
  greenery: GreeneryType;
  canvasWidth: number;
  canvasHeight: number;
  createdAt: string;
}

// Redux: builder wizard state (ephemeral, NOT persisted)
export interface BuilderState {
  step: 1 | 2 | 3;
  cart: CartFlower[];
  placedFlowers: PlacedFlower[];
  note: Note | null;
  greenery: GreeneryType;
  editingBouquetId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  isSavedToGarden: boolean; // true after saving — suppresses beforeunload warning
}

// Redux: garden state (persisted via redux-persist)
export interface GardenState {
  bouquets: Bouquet[];
}

// Root Redux state shape
export interface RootState {
  builder: BuilderState;
  garden: GardenState;
}

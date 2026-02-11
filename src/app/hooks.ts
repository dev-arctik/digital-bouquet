// Typed Redux hooks — use these instead of plain useDispatch/useSelector
// throughout the app to get proper type inference.

import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, AppRootState } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<AppRootState>();

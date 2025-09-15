import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Use these typed hooks in your app
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector = <TSelected>(selector: (state: RootState) => TSelected) =>
  useSelector(selector);

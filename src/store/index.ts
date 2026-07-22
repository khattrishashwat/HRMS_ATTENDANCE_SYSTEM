import { configureStore, Middleware } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import persistStorage from "redux-persist/lib/storage";
import userReducer, { setAccessToken, switchToEmployeeRole } from "./store.ts";
import uiReducer from "./uislice.ts";
import { combineReducers } from "redux";
import { loadEmployeeAuthData, saveEmployeeAuthData } from "../utils/rolePersistence.ts";
import { AuthData } from "./authTypes.ts";

// Vite CJS interop: import default is module.exports ({ default: engine }), not the engine.
type PersistStorageEngine = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const storage: PersistStorageEngine =
  typeof (persistStorage as PersistStorageEngine).getItem === "function"
    ? (persistStorage as PersistStorageEngine)
    : (persistStorage as unknown as { default: PersistStorageEngine }).default;

const employeeAuthTransform = createTransform(
  (inboundState: { employeeAuthData?: AuthData | null }) => {
    if (!inboundState) return inboundState;
    const { employeeAuthData: _employeeAuthData, ...rest } = inboundState;
    return rest;
  },
  (outboundState: { employeeAuthData?: AuthData | null }) => {
    if (!outboundState) return outboundState;
    const employeeAuthData = loadEmployeeAuthData();
    return {
      ...outboundState,
      employeeAuthData,
    };
  },
  { whitelist: ["auth"] }
);

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
  transforms: [employeeAuthTransform],
};

const rootReducer = combineReducers({
  auth: userReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const employeePersistMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);

  if (setAccessToken.match(action) || switchToEmployeeRole.match(action)) {
    const { isOrgAdmin, activeRoleMode, employeeAuthData } = storeApi.getState().auth;
    if (isOrgAdmin && activeRoleMode === "EMPLOYEE" && employeeAuthData) {
      saveEmployeeAuthData(employeeAuthData);
    }
  }

  return result;
};

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(employeePersistMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

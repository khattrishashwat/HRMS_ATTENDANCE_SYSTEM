import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes/AppRoutes";
import { store, persistor } from "./redux/index.ts";
import AuthInitializer from "./pages/Auth/AuthInitializer.tsx";
import TokenWatcher from "./pages/Auth/TokenWatcher.tsx";


function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <AuthInitializer />
          <TokenWatcher />
          <Routes>
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;

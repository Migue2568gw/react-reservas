import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/home";
import SignUp from "./pages/start/SignUp";
import Login from "./pages/start/login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NavigationBar from "./components/NavigationBar";
import Admin from "./pages/admin/Admin";
import { useAdmin } from "./hooks/useAdmin";
import NotFound from "./pages/NotFound";
import caramel from "./assets/images/caramel.png";
import { ToastContainer } from "react-toastify";
import AdminClientes from "./pages/admin/AdminClientes";
import AdminServicios from "./pages/admin/AdminServicios";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : children;
}

function ProtectedAdmin({ children }) {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="loading-container">
        <img src={caramel} alt="Logo de la barbería" className="loading-logo" />
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/signUp"
          element={
            <ProtectedRoute>
              <SignUp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <Admin />
            </ProtectedAdmin>
          }
        />
        <Route
          path="/adminServicios"
          element={
            <ProtectedAdmin>
              <AdminClientes />
            </ProtectedAdmin>
          }
        />
        <Route
          path="/adminClientes"
          element={
            <ProtectedAdmin>
              <AdminServicios />
            </ProtectedAdmin>
          }
        />
        <Route path="/notfound" element={<NotFound />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default App;

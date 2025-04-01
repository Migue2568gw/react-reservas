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
import EmployeeDate from "./pages/client/EmployeeDate";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : children;
}

function App() {
  return (
    <AuthProvider>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/empleado" element={<EmployeeDate />} />
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
        <Route path="/adminEmpleados" element={<Admin direc="empleados" />} />
        <Route path="/adminServicios" element={<Admin direc="servicios" />} />
        <Route path="/adminSubServicios" element={<Admin direc="sub servicios" />} />
        <Route path="/adminClientes" element={<Admin direc="clientes" />} />
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

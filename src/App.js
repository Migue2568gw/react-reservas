import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import SignUp from "./pages/start/SignUp";
import Login from "./pages/start/login";
import { useAuth } from "./context/AuthContext";
import NavigationBar from "./components/NavigationBar";
import Admin from "./pages/admin/Admin";
import NotFound from "./pages/NotFound";
import EmployeeDate from "./pages/client/EmployeeDate";
import { supabase } from "./supabase/client";
import ResetPassword from "./pages/start/resetPassword";
import { Toaster } from "sonner";
import ClienteMisCitas from "./pages/client/ClienteMisCitas";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = window.location.pathname;

  if (location === "/resetpass") return children;

  return user ? <Navigate to="/" /> : children;
}

function App() {
  const { user } = useAuth();
  useEffect(() => {
    const checkAndActivateUser = async () => {
      if (!user) return;

      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, active")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error al verificar perfil:", profileError.message);
        return;
      }

      if (existingProfile && !existingProfile.active) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ active: true })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error al activar el perfil:", updateError.message);
        } else {
          console.log("Perfil activado correctamente");
        }
      }
    };

    checkAndActivateUser();
  }, [user]);

  return (
    <>
      <Toaster richColors position="top-right" duration={1500} />
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
        <Route
          path="/resetpass"
          element={
            <ProtectedRoute>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/miscitas"
          element={
              <ClienteMisCitas />
          }
        />
        <Route path="/adminEmpleados" element={<Admin direc="empleados" />} />
        <Route path="/adminServicios" element={<Admin direc="servicios" />} />
        <Route
          path="/adminSubServicios"
          element={<Admin direc="sub servicios" />}
        />
        <Route path="/adminClientes" element={<Admin direc="clientes" />} />
        <Route path="/notfound" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;

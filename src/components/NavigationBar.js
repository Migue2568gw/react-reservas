import React, { useEffect, useState } from "react";
import logo from "../assets/images/LOGO.png";
import { Navbar } from "flowbite-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useAdmin } from "../hooks/useAdmin";

const NavigationBar = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error.message);
      return;
    }
    navigate("/");
  };

  return (
    <Navbar fluid={true} rounded={true} className="bg-black">
      <Navbar.Brand href="/">
        <img src={logo} className="mr-5 logo" alt="Logo de la Aplicación" />
        <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
          Example Names
        </span>
      </Navbar.Brand>

      <Navbar.Toggle />

      <Navbar.Collapse>
        {user ? (
          isMobile ? (
            // Menú cuando es móvil
            isAdmin ? (
              <>
                <Navbar.Link href="/admin" className="text-white">
                  Empleados
                </Navbar.Link>
                <Navbar.Link href="/adminServicios" className="text-white">
                  Servicios
                </Navbar.Link>
                <Navbar.Link href="/adminClientes" className="text-white">
                  Clientes
                </Navbar.Link>
                <Navbar.Link
                  onClick={handleSignOut}
                  className="text-white cursor-pointer"
                >
                  Cerrar sesión
                </Navbar.Link>
              </>
            ) : (
              <>
                <Navbar.Link href="/" className="text-white">
                  Inicio
                </Navbar.Link>
                <Navbar.Link
                  onClick={handleSignOut}
                  className="text-white cursor-pointer"
                >
                  Cerrar sesión
                </Navbar.Link>
              </>
            )
          ) : (
            // Menú cuando es escritorio
            <>
              <Navbar.Link href="/" className="text-white">
                Inicio
              </Navbar.Link>
              <Navbar.Link
                onClick={handleSignOut}
                className="text-white cursor-pointer"
              >
                Cerrar sesión
              </Navbar.Link>
            </>
          )
        ) : (
          <>
            <Navbar.Link href="/" className="text-white">
              Inicio
            </Navbar.Link>
            <Navbar.Link href="/login" className="text-white">
              Empezar
            </Navbar.Link>
          </>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;

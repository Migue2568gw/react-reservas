import React, { useEffect, useState } from "react";
import logo from "../assets/images/LOGO.png";
import { Navbar } from "flowbite-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useAdmin } from "../hooks/useAdmin";
import { toast } from "react-toastify";

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
      toast.error("Error al cerrar sesión:");
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
            isAdmin ? (
              <>
                <Navbar.Link href="/adminEmpleados" className="text-white">
                  Empleados
                </Navbar.Link>
                <Navbar.Link href="/adminServicios" className="text-white">
                  Servicios
                </Navbar.Link>
                <Navbar.Link href="/adminSubServicios" className="text-white">
                  Sub servicios
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
              Iniciar sesión
            </Navbar.Link>
          </>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;

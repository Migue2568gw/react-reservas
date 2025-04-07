import React, { useEffect, useState, useRef } from "react";
import logo from "../assets/images/LOGO.png";
import { Navbar } from "flowbite-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useAdmin } from "../hooks/useAdmin";
import { toast } from 'sonner';

const NavigationBar = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
      setMenuOpen(false);
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    <Navbar fluid={true} rounded={true} className="bg-black" ref={menuRef}>
      <Navbar.Brand href="/">
        <img src={logo} className="mr-5 logo" alt="Logo de la Aplicación" />
        <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
          Example Names
        </span>
      </Navbar.Brand>

      <Navbar.Toggle onClick={() => setMenuOpen(!menuOpen)} />

      <Navbar.Collapse className={`${menuOpen ? "block" : "hidden"}`}>
        {user ? (
          isMobile ? (
            isAdmin ? (
              <>
                <Navbar.Link href="/adminEmpleados" className="text-white" onClick={() => setMenuOpen(false)}>
                  Empleados
                </Navbar.Link>
                <Navbar.Link href="/adminServicios" className="text-white" onClick={() => setMenuOpen(false)}>
                  Servicios
                </Navbar.Link>
                <Navbar.Link href="/adminSubServicios" className="text-white" onClick={() => setMenuOpen(false)}>
                  Sub servicios
                </Navbar.Link>
                <Navbar.Link href="/adminClientes" className="text-white" onClick={() => setMenuOpen(false)}>
                  Clientes
                </Navbar.Link>
                <Navbar.Link
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }}
                  className="text-white cursor-pointer"
                >
                  Cerrar sesión
                </Navbar.Link>
              </>
            ) : (
              <>
                <Navbar.Link href="/" className="text-white" onClick={() => setMenuOpen(false)}>
                  Inicio
                </Navbar.Link>
                <Navbar.Link
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }}
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
            <Navbar.Link href="/" className="text-white" onClick={() => setMenuOpen(false)}>
              Inicio
            </Navbar.Link>
            <Navbar.Link href="/login" className="text-white" onClick={() => setMenuOpen(false)}>
              Iniciar sesión
            </Navbar.Link>
          </>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;

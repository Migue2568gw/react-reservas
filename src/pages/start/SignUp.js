import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";
import caramel from "../../assets/images/caramel.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SignUp() {
  const [nuevoCliente, setNuevoCliente] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const traducirError = (error) => {
    const traducciones = {
      "User already registered": "El usuario ya está registrado.",
      "Password should be at least 6 characters":
        "La contraseña debe tener al menos 6 caracteres.",
      "Email format is invalid": "El formato del correo es inválido.",
      "Error sending confirmation email":
        "Error al enviar el correo de confirmación.",
      "Auth API error: invalid_email": "El correo ingresado no es válido.",
      "Signup requires a valid email":
        "Debes ingresar un correo válido para registrarte.",
      "Network request failed":
        "Error de conexión. Revisa tu internet e inténtalo de nuevo.",
      "Unable to validate email address: invalid format":
        "No se pudo validar la dirección de correo. Revisa el formato.",
    };

    return (
      traducciones[error] ||
      "Ocurrió un error al registrarte. Inténtalo nuevamente."
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <img src={caramel} alt="Logo de la barbería" className="loading-logo" />
      </div>
    );
  }

  const validarDatos = (cliente) => {
    const errores = {};
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(cliente.name)) {
      errores.name = "El nombre solo debe contener letras y espacios.";
    }
    if (!/^\d{10}$/.test(cliente.phone)) {
      errores.phone =
        "El teléfono debe tener exactamente 10 dígitos numéricos.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) {
      errores.email = "El formato del correo es inválido.";
    }
    if (cliente.password.length < 6) {
      errores.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    return errores;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();    

    const errores = validarDatos(nuevoCliente);
    if (Object.keys(errores).length > 0) {
      Object.values(errores).forEach((error) => toast.error(error));
      return;
    }

    setLoading(true);
    const { data: existingUser, error: fetchError } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", nuevoCliente.email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      toast.error("Error verificando el usuario. Intenta de nuevo.");
      console.log(fetchError);
      return;
    }

    if (existingUser) {
      toast.error("Este correo ya está registrado.");
      return;
    }

    const { data: user, error } = await supabase.auth.signUp({
      email: nuevoCliente.email,
      password: nuevoCliente.password,
      options: {
        data: {
          display_name: nuevoCliente.name,
        },
      },
    });

    if (error) {
      toast.error(traducirError(error.message));
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const creds = {
      id: user?.user?.id || "",
      display_name: nuevoCliente.name.toUpperCase(),
      email: nuevoCliente.email,
      phone: nuevoCliente.phone || "",
      user_id: user?.user?.id || "",
      role: "user",
      active: false,
    };

    const { error: insertError } = await supabase
      .from("profiles")
      .insert(creds);

    if (insertError) {
      setLoading(false);
      console.error("Error al crear perfil:", insertError.message);
    } else {
      setLoading(false);
      navigate("/");
      toast.success("Registro exitoso. Verifica tu correo.");
    }
  };

  return (
    <div className="contacto-container">
      <div className="auth-container">
        <h2>Registro</h2>
        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre completo"
              value={nuevoCliente.name}
              onChange={(e) =>
                setNuevoCliente({ ...nuevoCliente, name: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Celular"
              value={nuevoCliente.phone}
              onChange={(e) =>
                setNuevoCliente({ ...nuevoCliente, phone: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Correo"
              value={nuevoCliente.email}
              onChange={(e) =>
                setNuevoCliente({ ...nuevoCliente, email: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={nuevoCliente.password}
              onChange={(e) =>
                setNuevoCliente({ ...nuevoCliente, password: e.target.value })
              }
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="btn-ok">
            <button className="btnOk" type="submit">
              Registrarse
            </button>
          </div>
        </form>
        <div className="toggle-auth">
          <span>¿Ya tienes una cuenta?</span>
          <button onClick={() => navigate("/login")}>Inicia Sesión</button>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const traducirError = (error) => {
    const traducciones = {
      "Invalid login credentials":
        "Credenciales inválidas. Verifica tu correo y contraseña.",
      "Email not confirmed":
        "El correo no ha sido confirmado. Revisa tu bandeja de entrada.",
      "User not found": "Usuario no encontrado. Verifica tu correo.",
      "Password should be at least 6 characters":
        "La contraseña debe tener al menos 6 caracteres.",
      "Auth API error: invalid_grant": "Correo o contraseña incorrectos.",
    };

    return traducciones[error] || "Ocurrió un error. Inténtalo de nuevo.";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(traducirError(error.message));
      return;
    }

    navigate("/");
  };

  return (
    <div className="contacto-container">
      <div className="auth-container">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="btn-ok">
            <button className="btnOk" type="submit">
              Ingresar
            </button>
          </div>
        </form>
        <div className="toggle-auth">
          <span>¿No tienes una cuenta?</span>
          <button onClick={() => navigate("/signUp")}>Registrar</button>
        </div>
      </div>
    </div>
  );
}

export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

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

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      toast.error("Por favor, ingresa tu correo electrónico.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/resetpass`,
    });

    if (!error) {
      toast.success(
        "Correo de recuperación enviado. Revisa tu bandeja de entrada."
      );

      setTimeout(() => {
        setShowResetModal(false);
        navigate("/");
      }, 1500);
    } else {
      toast.error("Error al enviar el correo. Verifica el correo ingresado.");
    }
  };

  return (
    <>
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
            <div className="form-group password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                Ingresar
              </button>
            </div>
          </form>
          <div className="toggle-auth">
            <span>¿No tienes una cuenta?</span>
            <button onClick={() => navigate("/signUp")}>Registrar</button>
          </div>
          <div className="forgot-password">
            <button onClick={() => setShowResetModal(true)}>
              Olvidé mi contraseña
            </button>
          </div>
        </div>
      </div>
      <>
        {showResetModal && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Recuperar contraseña</h3>
              <form onSubmit={handleResetPassword}>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
                <div className="popup-buttons">
                  <button className="btn-add" type="submit">
                    Enviar enlace
                  </button>
                  <button
                    className="btn-Clo"
                    onClick={() => setShowResetModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    </>
  );
}

export default Login;

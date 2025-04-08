import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { toast } from "sonner";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AuthError } from "../../utils/AuthError";
import LoadingScreen from "../../components/LoadingScreen";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <LoadingScreen />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("ingreso");
        toast.error(AuthError.get(error.code));
        return;
      }

      navigate("/");
    } catch (err) {
      console.error("Error inesperado: ", err.message);
      toast.error("Ocurrió un error inesperado. Intenta de nuevo.", {
        duration: 1500,
      });
    }
  };

  const handleResetPassword = async (e) => {
    setLoading(true);
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
        setLoading(false);
        navigate("/");
      }, 1000);
    } else {
      setLoading(false);
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

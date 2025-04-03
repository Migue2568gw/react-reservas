import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPassword() {
  const [resetPass, setResetPass] = useState({
    password: "",
    returnPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRtn, setShowPasswordRtn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function handleToken() {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data?.session) {
        console.log(error);
        navigate("/login");
      }
    }

    handleToken();
  }, [navigate]);

  const handleResetPass = async (e) => {
    e.preventDefault();

    if (resetPass.password !== resetPass.returnPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    if (resetPass.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: resetPass.password,
    });

    if (error) {
      toast.error("Error al actualizar la contraseña: " + error.message);
    } else {
      toast.success("Contraseña restablecida correctamente.");
      navigate("/login");
    }
  };

  return (
    <div className="contacto-container">
      <div className="auth-container">
        <h2>Restablecer contraseña</h2>
        <form onSubmit={handleResetPass}>
          <div className="form-group password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={resetPass.password}
              onChange={(e) =>
                setResetPass({ ...resetPass, password: e.target.value })
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

          <div className="form-group password-container">
            <input
              type={showPasswordRtn ? "text" : "password"}
              placeholder="Confirmar nueva contraseña"
              value={resetPass.returnPassword}
              onChange={(e) =>
                setResetPass({
                  ...resetPass,
                  returnPassword: e.target.value,
                })
              }
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPasswordRtn(!showPasswordRtn)}
            >
              {showPasswordRtn ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="btn-ok">
            <button className="btnOk" type="submit">
              Restablecer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;

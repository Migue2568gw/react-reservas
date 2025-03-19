import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";
import { useAdmin } from "../../hooks/useAdmin";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();

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

  const createProfileIfNotExists = async (user) => {
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error al verificar perfil:", profileError.message);
      return;
    }

    if (!existingProfile) {
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        display_name: user.user_metadata?.display_name || "",
        phone: user.user_metadata?.phone || "",
      });

      if (insertError) {
        console.error("Error al crear perfil:", insertError.message);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(traducirError(error.message));
      return;
    }

    const user = data.user;
    if (user) {
      await createProfileIfNotExists(user);
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

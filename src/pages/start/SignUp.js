import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

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

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { data: existingUser, error: fetchError } = await supabase
      .from("auth.users")
      .select("email")
      .eq("email", email)
      .single();
  
    if (fetchError && fetchError.code !== "PGRST116") { 
       toast.error("Error verificando el usuario. Intenta de nuevo.");
      return;
    }
  
    if (existingUser) {
      toast.error("El usuario ya está registrado. Intenta iniciar sesión.");
      return;
    }
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (error) {
      toast.error(traducirError(error.message));
      return;
    }
  
    toast.success(
      "Registro exitoso. Revisa tu correo para verificar tu cuenta."
    );
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Celular"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
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

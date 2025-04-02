import React, { useState } from "react";

function ResetPassword() {
  const [resetPass, setResetPass] = useState({
    password: "",
    returnPassword: "",
  });
  const handleResetPass = async (e) => {};
  return (
    <div className="contacto-container">
      <div className="auth-container">
        <h2>Restablecer contraseña</h2>
        <form onSubmit={handleResetPass}>
          <div className="form-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={resetPass.password}
              onChange={(e) => setResetPass({...resetPass ,password: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Repetir contraseña"
              value={resetPass.returnPassword}
              onChange={(e) => setResetPass({...resetPass ,returnPassword: e.target.value})}
              required
            />
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

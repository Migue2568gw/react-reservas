export class AuthError {
    static errors = {
      anonymous_provider_disabled: "El inicio de sesión anónimo está deshabilitado.",
      bad_code_verifier: "Código de verificación incorrecto. Intenta nuevamente.",
      bad_json: "Error en el formato de datos enviados.",
      bad_jwt: "Token inválido.",
      bad_oauth_callback: "Error en la respuesta del proveedor OAuth.",
      bad_oauth_state: "Error en el estado del flujo OAuth.",
      captcha_failed: "No se pudo verificar el CAPTCHA.",
      conflict: "Conflicto en la base de datos. Intenta nuevamente.",
      email_address_invalid: "Correo electrónico inválido.",
      email_address_not_authorized: "Este correo no está autorizado. Configura SMTP personalizado.",
      email_conflict_identity_not_deletable: "No se puede eliminar esta identidad. Ya existe un usuario con ese correo.",
      email_exists: "El correo ya está registrado.",
      email_not_confirmed: "Debes confirmar tu correo para iniciar sesión.",
      email_provider_disabled: "El inicio de sesión con correo está deshabilitado.",
      flow_state_expired: "Tu sesión ha expirado. Inicia sesión nuevamente.",
      flow_state_not_found: "No se encontró tu sesión. Intenta de nuevo.",
      hook_payload_invalid_content_type: "Tipo de contenido inválido en el hook.",
      hook_payload_over_size_limit: "El hook excede el tamaño permitido.",
      hook_timeout: "El hook no respondió a tiempo.",
      identity_already_exists: "La identidad ya está vinculada a un usuario.",
      identity_not_found: "Identidad no encontrada.",
      insufficient_aal: "Debes completar un reto MFA para continuar.",
      invite_not_found: "El enlace de invitación expiró o ya fue usado.",
      invalid_credentials: "Correo o contraseña incorrectos.",
      manual_linking_disabled: "No se permite vinculación manual de identidades.",
      mfa_challenge_expired: "Tu reto MFA ha expirado. Intenta nuevamente.",
      mfa_verification_failed: "Código MFA incorrecto.",
      no_authorization: "Falta el token de autenticación.",
      not_admin: "No tienes permisos de administrador.",
      oauth_provider_not_supported: "Proveedor OAuth no soportado.",
      otp_disabled: "Inicio de sesión con OTP deshabilitado.",
      otp_expired: "El código ha expirado. Solicita uno nuevo.",
      over_email_send_rate_limit: "Demasiados correos enviados. Espera un momento.",
      over_request_rate_limit: "Demasiadas solicitudes. Intenta más tarde.",
      phone_exists: "Este número de teléfono ya está registrado.",
      phone_not_confirmed: "El número de teléfono no ha sido confirmado.",
      provider_disabled: "Proveedor OAuth deshabilitado.",
      provider_email_needs_verification: "El correo del proveedor OAuth necesita verificación.",
      reauthentication_needed: "Debes reautenticarte para esta acción.",
      refresh_token_not_found: "No se encontró el token de sesión.",
      request_timeout: "La solicitud tardó demasiado. Intenta de nuevo.",
      same_password: "La nueva contraseña debe ser diferente a la anterior.",
      session_expired: "Tu sesión ha expirado.",
      session_not_found: "Sesión no encontrada.",
      signup_disabled: "El registro está deshabilitado.",
      sms_send_failed: "Error al enviar el SMS.",
      too_many_enrolled_mfa_factors: "Ya tienes muchos factores MFA registrados.",
      unexpected_failure: "Algo salió mal. Intenta de nuevo.",
      user_already_exists: "Ya existe un usuario con esta información.",
      user_banned: "Tu cuenta ha sido suspendida temporalmente.",
      user_not_found: "Usuario no encontrado.",
      user_sso_managed: "Este usuario es gestionado por SSO y no se puede modificar.",
      validation_failed: "Algunos datos ingresados no son válidos.",
      weak_password: "La contraseña no cumple con los requisitos mínimos.",
    };
  
    static get(code) {
      return this.errors[code] || "Ocurrió un error inesperado. Intenta de nuevo.";
    }
  }
  
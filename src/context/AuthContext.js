import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error?.message === "Session from session_id claim in JWT does not exist") {
        console.log("Sesión inválida - limpiando token");
        setUser(null);
        return;
      }
  
      setUser(session?.user || null);
    };
  
    checkSession();
  
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || event === "USER_DELETED") {
          setUser(null);
        } else {
          setUser(session?.user || null);
        }
      }
    );
  
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

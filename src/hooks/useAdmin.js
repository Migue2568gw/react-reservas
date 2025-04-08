import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase/client";

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error obteniendo rol:", error.message);
        setLoading(false);
        return;
      }

      setIsAdmin(data.role === "admin");
      setLoading(false);
    };

    getRole();
  }, [user]);

  return { isAdmin, loading };
};

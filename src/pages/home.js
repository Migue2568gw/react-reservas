import React, { useEffect, useState } from "react";
import Admin from "./admin/Admin";
import { useAdmin } from "../hooks/useAdmin";
import Client from "./client/Client";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

function Home() {
  const { user } = useAuth();
  const { isAdmin, loading: loadingAdmin } = useAdmin();
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [user]);

  if (loadingAdmin) {
    return <LoadingScreen />;
  }

  return (
    <div key={key}>
      {!user ? <Client /> : isAdmin ? <Admin /> : <Client />}
    </div>
  );
}

export default Home;

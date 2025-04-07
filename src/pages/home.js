import React, { useEffect, useState } from "react";
import Admin from "./admin/Admin";
import { useAdmin } from "../hooks/useAdmin";
import caramel from "../assets/images/caramel.png";
import Client from "./client/Client";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();
  const { isAdmin, loading: loadingAdmin } = useAdmin();
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [user]);

  if (loadingAdmin) {
    return (
      <div className="loading-container">
        <img src={caramel} alt="Logo de la barbería" className="loading-logo" />
      </div>
    );
  }

  return (
    <div key={key}>
      {!user ? <Client /> : isAdmin ? <Admin /> : <Client />}
    </div>
  );
}

export default Home;

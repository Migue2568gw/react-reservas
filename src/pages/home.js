import React from "react";
import Admin from "./admin/Admin";
import { useAdmin } from "../hooks/useAdmin";
import caramel from "../assets/images/caramel.png";
import Client from "./client/Client";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { isAdmin, loading } = useAdmin();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <img src={caramel} alt="Logo de la barbería" className="loading-logo" />
      </div>
    );
  }

  return (
    <>
      {!user ? <Client /> : isAdmin ? <Admin /> : <Client />}
    </>
  );
}

export default Home;

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import AdminEmpleados from "./AdminEmpleados";
import AdminServicios from "./AdminServicios";
import AdminClientes from "./AdminClientes";
import { useAdmin } from "../../hooks/useAdmin";
import NotFound from "../NotFound";
import AdminSubServicios from "./AdminSubServicio";

const Admin = ({ direc }) => {
  const { isAdmin } = useAdmin();
  const [navigate, setNavigate] = useState(direc || "empleado");

  if (isAdmin === false) {
    return null;
  } else if (!isAdmin) {
    return <NotFound />;
  }

  const renderContent = () => {
    switch (navigate) {
      case "empleados":
        return <AdminEmpleados />;
      case "servicios":
        return <AdminServicios />;
      case "sub servicios":
        return <AdminSubServicios />;
      case "clientes":
        return <AdminClientes />;
      default:
        return <AdminEmpleados />;
    }
  };

  return (
    <div className="admin-container">
      <Sidebar
        title="Panel de control"
        items={["Empleados", "Servicios", "Sub servicios", "Clientes"]}
        onNavigate={setNavigate}
      />
      <div className="AdContent-list">{renderContent()}</div>
    </div>
  );
};

export default Admin;

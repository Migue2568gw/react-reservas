import React from "react";
import Sidebar from "../../components/Sidebar";
import AdminEmpleados from "./AdminEmpleados";
import AdminServicios from "./AdminServicios";
import AdminClientes from "./AdminClientes";
import { useAdmin } from "../../hooks/useAdmin";
import NotFound from "../NotFound";

const Admin = ({ direc }) => {
  const { isAdmin } = useAdmin();

  if (isAdmin === false) {
    return null; 
  }else  if (!isAdmin) {
    return <NotFound />;
  }


 
  const renderContent = () => {
    switch (direc) {
      case "empleado":
        return <AdminEmpleados />;
      case "servicio":
        return <AdminServicios />;
      case "cliente":
        return <AdminClientes />;
      default:
        return <AdminEmpleados />;
    }
  };

  return (
    <div className="admin-container">
      <Sidebar
        title="Panel de control"
        items={["Empleados", "Servicios", "Clientes"]}
      />
      <div className="AdContent-list">{renderContent()}</div>
    </div>
  );
};

export default Admin;

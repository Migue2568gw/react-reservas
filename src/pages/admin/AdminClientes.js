import React, { useEffect, useState } from "react";
import { toast } from 'sonner';
import { supabase } from "../../supabase/client";

function AdminClientes() {
  const [clientesList, setClientesList] = useState([]);
  const [filteredCliente, setFilteredCliente] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from("profiles_with_email")
        .select("*");

      if (error) {
        toast.error("Error al obtener clientes");
      } else {
        setClientesList(data || []);
      }
    };
  
    fetchClientes();
  }, []);
    
   useEffect(() => {
    setFilteredCliente(
        clientesList.filter((client) =>
          client.display_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }, [clientesList, searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = clientesList.filter((client) =>
      client.display_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCliente(filtered);
  };
  return (
    <>
      <div className="button-content">
        <input
          type="text"
          className="FindTxt"
          placeholder="Buscar cliente..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {filteredCliente.map((cliente) => (
        <div key={cliente.id} className="AdContent-item">
          <p>Nombre cliente: {cliente.display_name}</p>
          <p>Celular: {cliente.phone}</p>
          <p>Email: {cliente.email}</p>
        </div>
      ))}
    </>
  );
}

export default AdminClientes;

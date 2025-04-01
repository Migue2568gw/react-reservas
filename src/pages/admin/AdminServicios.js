import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";

function AdminServicios() {
  const [showPopupAdd, setShowPopupAdd] = useState(false);
  const [showPopupDelete, setShowPopupDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [serviciosList, setServiciosList] = useState([]);
  const [filteredServicios, setFilteredServicios] = useState([]);
  const [nuevoServicio, setNuevoServicio] = useState({
    id: null,
    nombre: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchServicios = async () => {
      const { data, error } = await supabase.from("services").select("*");
      if (error) {
        toast.error("Error al obtener servicios");
      } else {
        setServiciosList(data || []);
      }
    };

    fetchServicios();

    const subscription = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        fetchServicios
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    setFilteredServicios(
      serviciosList.filter((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [serviciosList, searchQuery]);

  const handleCargarServicios = async () => {
    const { data, error } = await supabase.from("services").select("*");

    if (error) {
      toast.error("Error al obtener servicios");
    } else {
      setServiciosList(data || []);
    }
  };

  const handleNewService = () => {
    setIsEditing(false);
    setNuevoServicio({
      id: null,
      nombre: "",
    });
    setShowPopupAdd(true);
  };

  const addOrUpdateServicio = async () => {
    if (isEditing) {
      const { error } = await supabase
        .from("services")
        .update({
          name: nuevoServicio.nombre,
        })
        .eq("id", nuevoServicio.id);

      if (error) {
        toast.error("Error al actualizar servicio");
        return;
      } else {
        toast.success("Servicio actualizado correctamente.");
      }

      await handleCargarServicios();
    } else {
      const { data: servicio, error } = await supabase
        .from("services")
        .insert([
          {
            name: nuevoServicio.nombre,
          },
        ])
        .select()
        .single();

      if (error || !servicio) {
        toast.error("Error al ingresar servicio");
        return;
      } else {
        toast.success("Servicio adicionado satisfactoriamente.");
      }

      await handleCargarServicios();
    }

    setShowPopupAdd(false);
    setNuevoServicio({
      id: null,
      nombre: "",
    });
  };

  const handleModificarServicio = async (idServicio) => {
    setShowPopupAdd(true);
    setIsEditing(true);

    const { data: resultServices, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", idServicio)
      .single();

    if (error) {
      toast.error("Error al obtener el servicios");
      return;
    }

    setNuevoServicio({
      id: resultServices.id,
      nombre: resultServices.name,
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = serviciosList.filter((service) =>
      service.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredServicios(filtered);
  };

  const handleEliminar = async (idServicio) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .delete()
        .eq("id", idServicio);

      if (error) {
        toast.error("Error eliminando servicio: " + error.message, {
          position: "bottom-right",
        });
      } else {
        toast.success("Servicio eliminado correctamente", {
          position: "bottom-right",
        });
      }
      handleCargarServicios();
      setShowPopupDelete(false);
      setShowPopupAdd(false);
    } catch (error) {
      toast.error("Error eliminando servicio " + error.message, {
        position: "bottom-right",
      });
    }
  };

  return (
    <>
      <>
        <div className="button-content">
          <button className="btnAdd" onClick={() => handleNewService(true)}>
            Adicionar Servicio
          </button>
          <input
            type="text"
            className="FindTxt"
            placeholder="Buscar Servicio..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {filteredServicios.map((servicio) => (
          <div
            key={servicio.id}
            className="AdContent-item"
            onClick={() => handleModificarServicio(servicio.id)}
          >
            <p>Nombre del servicio: {servicio.name}</p>
          </div>
        ))}
      </>
      {showPopupAdd && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Adicionar servicio</h3>
            <label>Nombre</label>
            <input
              type="text"
              value={nuevoServicio.nombre}
              onChange={(e) =>
                setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })
              }
            />

            <div className="popup-buttons">
              <button className="btn-add" onClick={addOrUpdateServicio}>
                {isEditing ? "Actualizar" : "Adicionar"}
              </button>
              {isEditing ? (
                <button
                  className="btn-Clo"
                  onClick={() => setShowPopupDelete(true)}
                >
                  Eliminar
                </button>
              ) : (
                <></>
              )}

              <button
                className="btn-Clo"
                onClick={() => setShowPopupAdd(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopupDelete && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Esta seguro de querer eliminar este servicio</h3>

            <div className="popup-buttons">
              <button
                className="btn-add"
                onClick={() => handleEliminar(nuevoServicio.id)}
              >
                Confirmar
              </button>
              <button
                className="btn-Clo"
                onClick={() => setShowPopupDelete(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminServicios;

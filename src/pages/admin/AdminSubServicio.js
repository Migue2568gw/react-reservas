import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";

function AdminSubServicios() {
  const [showPopupAdd, setShowPopupAdd] = useState(false);
    const [showPopupDelete, setShowPopupDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [subServiciosList, setSubServiciosList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [serviciosList, setServiciosList] = useState([]);
  const [filteredSubServicios, setFilteredSubServicios] = useState([]);
  const [nuevoSubServicio, setNuevoSubServicio] = useState({
    id: null,
    nombre: "",
    duracion: "",
    precio: "",
    role_id: "",
    service_id: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSubServicios = async () => {
      const { data, error } = await supabase
        .from("subservices")
        .select("*, roles(name), services(name)");

      if (error) {
        toast.error("Error al obtener sub servicios");
      } else {
        setSubServiciosList(data || []);
      }
    };

    const fetchRoles = async () => {
      const { data, error } = await supabase.from("roles").select("*");
      if (error) {
        toast.error("Error al obtener roles");
      } else {
        setRolesList(data || []);
      }
    };

    const fetchServicios = async () => {
      const { data, error } = await supabase.from("services").select("*");
      if (error) {
        toast.error("Error al obtener servicios");
      } else {
        setServiciosList(data || []);
      }
    };

    fetchSubServicios();
    fetchServicios();
    fetchRoles();

    const subscription = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subservices" },
        fetchSubServicios
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    setFilteredSubServicios(
      subServiciosList.filter((subservice) =>
        subservice.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [subServiciosList, searchQuery]);

  const handleCargarSubServicios = async () => {
    const { data, error } = await supabase
      .from("subservices")
      .select("*, roles(name), services(name)");

    if (error) {
      toast.error("Error al obtener sub servicios");
    } else {
      setSubServiciosList(data || []);
    }
  };

  const handleNewService = () => {
    setIsEditing(false);
    setNuevoSubServicio({
      id: null,
      nombre: "",
      duracion: "",
      precio: "",
      role_id: "",
      service_id: "",
    });
    setShowPopupAdd(true);
  };

  const addOrUpdateSubServicio = async () => {
    if (isEditing) {
      const { error } = await supabase
        .from("subservices")
        .update({
          name: nuevoSubServicio.nombre,
          duration: nuevoSubServicio.duracion,
          price: nuevoSubServicio.precio,
          role_id: nuevoSubServicio.role_id,
          service_id: nuevoSubServicio.service_id,
        })
        .eq("id", nuevoSubServicio.id);

      if (error) {
        toast.error("Error al actualizar sub servicio");
        return;
      } else {
        toast.success("Sub Servicio actualizado correctamente.");
      }

      await handleCargarSubServicios();
    } else {
      const { data: servicio, error } = await supabase
        .from("subservices")
        .insert([
          {
            name: nuevoSubServicio.nombre,
            duration: nuevoSubServicio.duracion,
            price: nuevoSubServicio.precio,
            role_id: nuevoSubServicio.role_id,
            service_id: nuevoSubServicio.service_id,
          },
        ])
        .select()
        .single();

      if (error || !servicio) {
        toast.error("Error al ingresar sub servicio");
        return;
      } else {
        toast.success("Sub servicio adicionado satisfactoriamente.");
      }
      
      await handleCargarSubServicios();
    }

    setShowPopupAdd(false);
    setNuevoSubServicio({
      id: null,
      nombre: "",
      duracion: "",
      precio: "",
      role_id: "",
      service_id: "",
    });
  };

  const handleModificarSubServicio = async (idSubServicio) => {
    setShowPopupAdd(true);
    setIsEditing(true);

    const { data: resultSubServices, error } = await supabase
      .from("subservices")
      .select("*")
      .eq("id", idSubServicio)
      .single();

    if (error) {
      toast.error("Error al obtener el sub servicios");
      return;
    }

    setNuevoSubServicio({
      id: resultSubServices.id,
      nombre: resultSubServices.name,
      duracion: resultSubServices.duration,
      precio: resultSubServices.price,
      role_id: resultSubServices.role_id,
      service_id: resultSubServices.service_id,
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = subServiciosList.filter((subservice) =>
      subservice.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSubServicios(filtered);
  };

    const handleEliminar = async (idSubServicio) => {
      try {
        const { data, error } = await supabase
          .from("subservices")
          .delete()
          .eq("id", idSubServicio);
  
        if (error) {
          toast.error("Error eliminando sub servicio: " + error.message, {
            position: "bottom-right",
          });
        } else {
          toast.success("Sub servicio eliminado correctamente", {
            position: "bottom-right",
          });
        }
        handleCargarSubServicios();
        setShowPopupDelete(false);
        setShowPopupAdd(false);
      } catch (error) {
        toast.error("Error eliminando sub servicio " + error.message, {
          position: "bottom-right",
        });
      }
    };
  return (
    <>
      <>
        <div className="button-content">
          <button className="btnAdd" onClick={() => handleNewService(true)}>
            Adicionar Sub Servicio
          </button>
          <input
            type="text"
            className="FindTxt"
            placeholder="Buscar Sub Servicio..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {filteredSubServicios.map((servicio) => (
          <div
            key={servicio.id}
            className="AdContent-item"
            onClick={() => handleModificarSubServicio(servicio.id)}
          >
            {servicio.photo_url && (
              <img src={servicio.photo_url} alt="Servico" width={100} />
            )}
            <p>Nombre sub servicio: {servicio.name}</p>
            <p>Duración sub servicio: {servicio.duration} Min</p>
            <p>Precio: {servicio.price}</p>
            <p>Servicio asignado: {servicio.services.name}</p>
          </div>
        ))}
      </>
      {showPopupAdd && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Adicionar sub servicio</h3>
            <label>Nombre</label>
            <input
              type="text"
              value={nuevoSubServicio.nombre}
              onChange={(e) =>
                setNuevoSubServicio({
                  ...nuevoSubServicio,
                  nombre: e.target.value,
                })
              }
            />

            <label>Duración del servicio</label>
            <input
              type="text"
              value={nuevoSubServicio.duracion}
              onChange={(e) =>
                setNuevoSubServicio({
                  ...nuevoSubServicio,
                  duracion: e.target.value,
                })
              }
            />

            <label>Precio</label>
            <input
              type="number"
              value={nuevoSubServicio.precio}
              onChange={(e) =>
                setNuevoSubServicio({
                  ...nuevoSubServicio,
                  precio: e.target.value,
                })
              }
            />

            <label>Rol del empleado que realiza el servicio</label>
            <select
              value={nuevoSubServicio.role_id}
              onChange={(e) =>
                setNuevoSubServicio({
                  ...nuevoSubServicio,
                  role_id: e.target.value,
                })
              }
            >
              <option value="">Seleccione un rol</option>
              {rolesList.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.name}
                </option>
              ))}
            </select>

            <label>Servicio Asignado</label>
            <select
              value={nuevoSubServicio.service_id}
              onChange={(e) =>
                setNuevoSubServicio({
                  ...nuevoSubServicio,
                  service_id: e.target.value,
                })
              }
            >
              <option value="">Seleccione un servicio</option>
              {serviciosList.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.name}
                </option>
              ))}
            </select>

            <div className="popup-buttons">
              <button className="btn-add" onClick={addOrUpdateSubServicio}>
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
            <h3>Esta seguro de querer eliminar este sub servicio</h3>

            <div className="popup-buttons">
              <button
                className="btn-add"
                onClick={() => handleEliminar(nuevoSubServicio.id)}
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

export default AdminSubServicios;

import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";

function AdminServicios() {
  const [showPopupAdd, setShowPopupAdd] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [serviciosList, setServiciosList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [filteredServicios, setFilteredServicios] = useState([]);
  const [nuevoServicio, setNuevoServicio] = useState({
    id: null,
    nombre: "",
    duracion: "",
    descripcion: "",
    precio: "",
    foto: "",
    role_id: "",
    fotoAntigua: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchServicios = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*, roles(name)");
      if (error) {
        toast.error("Error al obtener servicios");
      } else {
        setServiciosList(data || []);
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
    fetchServicios();
    fetchRoles();

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

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNuevoServicio({ ...nuevoServicio, foto: file });
  };

  const handleNewService = () => {
    setIsEditing(false);
    setNuevoServicio({
      id: null,
      nombre: "",
      duracion: "",
      descripcion: "",
      precio: "",
      foto: "",
      role_id: "",
      fotoAntigua: "",
    });
    setShowPopupAdd(true);
  };

  const addOrUpdateServicio = async () => {
    let fotoUrl = nuevoServicio.fotoAntigua;

    if (
      nuevoServicio.foto &&
      nuevoServicio.foto !== nuevoServicio.fotoAntigua
    ) {
      if (nuevoServicio.fotoAntigua) {
        const oldFilePath = nuevoServicio.fotoAntigua.split("/").pop();
        await supabase.storage
          .from("fotos")
          .remove([`services/${oldFilePath}`]);
      }

      const filePath = `services/${Date.now()}-${nuevoServicio.foto.name}`;
      const { error: uploadError } = await supabase.storage
        .from("fotos")
        .upload(filePath, nuevoServicio.foto);

      if (uploadError) {
        toast.error("Error al subir la foto");
        return;
      }

      const { data: publicURL } = supabase.storage
        .from("fotos")
        .getPublicUrl(filePath);
      fotoUrl = publicURL.publicUrl;
    }

    if (isEditing) {
      const { error } = await supabase
        .from("services")
        .update({
          name: nuevoServicio.nombre,
          duration: nuevoServicio.duracion,
          description: nuevoServicio.descripcion,
          price: nuevoServicio.precio,
          photo_url: fotoUrl,
          role_id: nuevoServicio.role_id,
        })
        .eq("id", nuevoServicio.id);

      if (error) {
        toast.error("Error al actualizar servicio");
        return;
      } else {
        toast.success("Servicio actualizado correctamente.");
      }

      const fetchServicios = async () => {
        const { data, error } = await supabase
          .from("services")
          .select("*, roles(name)");
      
        if (error) {
          toast.error("Error al obtener servicios");
        } else {
          setServiciosList(data || []);
        }
      };
      
      await fetchServicios();
      
    } else {
      const { data: servicio, error } = await supabase
        .from("services")
        .insert([
          {
            name: nuevoServicio.nombre,
            duration: nuevoServicio.duracion,
            description: nuevoServicio.descripcion,
            price: nuevoServicio.precio,
            photo_url: fotoUrl,
            role_id: nuevoServicio.role_id,
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

      setServiciosList([...serviciosList]);
    }

    setShowPopupAdd(false);
    setNuevoServicio({
      id: null,
      nombre: "",
      duracion: "",
      descripcion: "",
      precio: "",
      foto: "",
      role_id: "",
      fotoAntigua: "",
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
      duracion: resultServices.duration,
      descripcion: resultServices.description,
      precio: resultServices.price,
      foto: resultServices.photo_url,
      role_id: resultServices.role_id,
      fotoAntigua: resultServices.photo_url,
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = serviciosList.filter((service) =>
      service.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredServicios(filtered);
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
            {servicio.photo_url && (
              <img src={servicio.photo_url} alt="Servico" width={100} />
            )}
            <p>Nombre: {servicio.name}</p>
            <p>Duración servicio: {servicio.duration} Min</p>
            <p>Precio: {servicio.price}</p>
            <p>Asignacion: {servicio.roles.name}</p>
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
            <label>Duración del servicio</label>
            <input
              type="text"
              value={nuevoServicio.duracion}
              onChange={(e) =>
                setNuevoServicio({ ...nuevoServicio, duracion: e.target.value })
              }
            />
            <label>Descripción</label>
            <input
              type="text"
              value={nuevoServicio.descripcion}
              onChange={(e) =>
                setNuevoServicio({
                  ...nuevoServicio,
                  descripcion: e.target.value,
                })
              }
            />
            <label>Precio</label>
            <input
              type="number"
              value={nuevoServicio.precio}
              onChange={(e) =>
                setNuevoServicio({ ...nuevoServicio, precio: e.target.value })
              }
            />

            <label>Rol del empleado que realiza el servicio</label>
            <select
              value={nuevoServicio.role_id}
              onChange={(e) =>
                setNuevoServicio({ ...nuevoServicio, role_id: e.target.value })
              }
            >
              <option value="">Seleccione un rol</option>
              {rolesList.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.name}
                </option>
              ))}
            </select>

            <label>Foto</label>
            <input type="file" accept="image/*" onChange={handleFotoUpload} />

            <div className="popup-buttons">
              <button className="btn-add" onClick={addOrUpdateServicio}>
                {isEditing ? "Actualizar" : "Adicionar"}
              </button>
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
    </>
  );
}

export default AdminServicios;

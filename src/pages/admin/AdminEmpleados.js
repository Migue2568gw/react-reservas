import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { supabase } from "../../supabase/client";
import { toast } from 'sonner';

const AdminEmpleados = () => {
  const [showPopupAdd, setShowPopupAdd] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [empleadosList, setEmpleadosList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState([]);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    id: null,
    nombre: "",
    telefono: "",
    email: "",
    foto: "",
    role_id: "",
    fotoAntigua: "",
    horainicio: "",
    horafin: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [diasNoTrabaja, setDiasNoTrabaja] = useState([]);

  useEffect(() => {
    const fetchEmpleados = async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*, roles(name)");

      if (error) {
        toast.error("Error al obtener empleados");
      } else {
        setEmpleadosList(data || []);
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

    fetchEmpleados();
    fetchRoles();

    const subscription = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employees" },
        fetchEmpleados
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    setFilteredEmpleados(
      empleadosList.filter((employee) =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [empleadosList, searchQuery]);

  const handleDayClick = (date) => {
    const dateString = date.toISOString().split("T")[0];
    if (diasNoTrabaja.includes(dateString)) {
      setDiasNoTrabaja(diasNoTrabaja.filter((day) => day !== dateString));
    } else {
      setDiasNoTrabaja([...diasNoTrabaja, dateString]);
    }
  };

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNuevoEmpleado({ ...nuevoEmpleado, foto: file });
  };

  const handleNewEmployee = () => {
    setIsEditing(false);
    setNuevoEmpleado({
      id: null,
      nombre: "",
      telefono: "",
      foto: "",
      email: "",
      fotoAntigua: "",
      role_id: "",
      horainicio: "",
      horafin: "",
    });
    setDiasNoTrabaja([]);
    setShowPopupAdd(true);
  };

  const addOrUpdateEmpleado = async () => {
    let fotoUrl = nuevoEmpleado.fotoAntigua;

    if (
      nuevoEmpleado.foto &&
      nuevoEmpleado.foto !== nuevoEmpleado.fotoAntigua
    ) {
      if (nuevoEmpleado.fotoAntigua) {
        const oldFilePath = nuevoEmpleado.fotoAntigua.split("/").pop();
        await supabase.storage
          .from("fotos")
          .remove([`employees/${oldFilePath}`]);
      }

      const filePath = `employees/${Date.now()}-${nuevoEmpleado.foto.name}`;
      const { error: uploadError } = await supabase.storage
        .from("fotos")
        .upload(filePath, nuevoEmpleado.foto);

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
        .from("employees")
        .update({
          name: nuevoEmpleado.nombre.toUpperCase(),
          phone: nuevoEmpleado.telefono,
          employee_email: nuevoEmpleado.email,
          photo_url: fotoUrl,
          role_id: nuevoEmpleado.role_id,
          start_time: nuevoEmpleado.horainicio,
          end_time: nuevoEmpleado.horafin,
        })
        .eq("id", nuevoEmpleado.id);

      if (error) {
        toast.error("Error al actualizar empleado");
        return;
      } else {
        toast.success("Empleado actualizado correctamente.");
      }

      await supabase
        .from("shifts")
        .delete()
        .eq("employee_id", nuevoEmpleado.id);
      const shifts = diasNoTrabaja.map((dia) => ({
        employee_id: nuevoEmpleado.id,
        day: dia,
      }));
      await supabase.from("shifts").insert(shifts);

      const fetchEmpleados = async () => {
        const { data, error } = await supabase
          .from("employees")
          .select("*, roles(name)");

        if (error) {
          toast.error("Error al obtener empleados");
        } else {
          setEmpleadosList(data || []);
        }
      };

      await fetchEmpleados();
    } else {
      const { data: empleado, error } = await supabase
        .from("employees")
        .insert([
          {
            name: nuevoEmpleado.nombre.toUpperCase(),
            phone: nuevoEmpleado.telefono,
            employee_email: nuevoEmpleado.email,
            photo_url: fotoUrl,
            role_id: nuevoEmpleado.role_id,
            start_time: nuevoEmpleado.horainicio,
            end_time: nuevoEmpleado.horafin,
          },
        ])
        .select()
        .single();

      if (error || !empleado) {
        toast.error("Error al ingresar Empleado");
        return;
      } else {
        toast.success("Empleado adicionado satisfactoriamente.");
      }

      const shifts = diasNoTrabaja.map((dia) => ({
        employee_id: empleado.id,
        day: dia,
      }));

      await supabase.from("shifts").insert(shifts);

      const fetchEmpleados = async () => {
        const { data, error } = await supabase
          .from("employees")
          .select("*, roles(name)");

        if (error) {
          toast.error("Error al obtener empleados");
        } else {
          setEmpleadosList(data || []);
        }
      };

      await fetchEmpleados();
    }

    setShowPopupAdd(false);
    setNuevoEmpleado({
      id: null,
      nombre: "",
      telefono: "",
      email: "",
      foto: "",
      fotoAntigua: "",
      role_id: "",
      horainicio: "",
      horafin: "",
    });
    setDiasNoTrabaja([]);
  };

  const handleModificarEmpleado = async (idEmpleado) => {
    setShowPopupAdd(true);
    setIsEditing(true);

    const { data: resultEmployee, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", idEmpleado)
      .single();

    if (error) {
      toast.error("Error al obtener el empleado");
      return;
    }

    setNuevoEmpleado({
      id: resultEmployee.id,
      nombre: resultEmployee.name,
      telefono: resultEmployee.phone,
      email: resultEmployee.employee_email,
      role_id: resultEmployee.role_id,
      foto: resultEmployee.photo_url,
      fotoAntigua: resultEmployee.photo_url,
      horainicio: resultEmployee.start_time,
      horafin: resultEmployee.end_time,
    });

    const { data: shifts } = await supabase
      .from("shifts")
      .select("day")
      .eq("employee_id", idEmpleado);

    setDiasNoTrabaja(shifts?.map((s) => s.day) || []);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = empleadosList.filter((employee) =>
      employee.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredEmpleados(filtered);
  };

  return (
    <>
      <>
        <div className="button-content">
          <button className="btnAdd" onClick={() => handleNewEmployee(true)}>
            Adicionar Empleado
          </button>
          <input
            type="text"
            className="FindTxt"
            placeholder="Buscar Empleado..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {filteredEmpleados.map((empleado) => (
          <div
            key={empleado.id}
            className="AdContent-item"
            onClick={() => handleModificarEmpleado(empleado.id)}
          >
            {empleado.photo_url && (
              <img src={empleado.photo_url} alt="Empleado" width={100} />
            )}
            <p>Nombre: {empleado.name}</p>
            <p>Correo electronico: {empleado.employee_email}</p>
            <p>Teléfono: {empleado.phone}</p>
            <p>Asignacion: {empleado.roles.name}</p>
          </div>
        ))}
      </>
      {showPopupAdd && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Adicionar Empleado</h3>
            <label>Nombre</label>
            <input
              type="text"
              value={nuevoEmpleado.nombre}
              onChange={(e) =>
                setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })
              }
            />
            <label>Correo electronico</label>
            <input
              type="email"
              value={nuevoEmpleado.email}
              onChange={(e) =>
                setNuevoEmpleado({ ...nuevoEmpleado, email: e.target.value })
              }
            />
            <label>Teléfono</label>
            <input
              type="number"
              value={nuevoEmpleado.telefono}
              onChange={(e) =>
                setNuevoEmpleado({ ...nuevoEmpleado, telefono: e.target.value })
              }
            />

            <label>Hora entrada</label>
            <input
              type="time"
              value={nuevoEmpleado.horainicio || ""}
              onChange={(e) => {
                const timeValue = e.target.value;
                const formattedTime = timeValue
                  ? `${timeValue}:00`.substring(0, 8)
                  : "";
                setNuevoEmpleado({
                  ...nuevoEmpleado,
                  horainicio: formattedTime,
                });
              }}
            />

            <label>Hora salida</label>
            <input
              type="time"
              value={nuevoEmpleado.horafin || ""}
              onChange={(e) => {
                const timeValue = e.target.value;
                const formattedTime = timeValue
                  ? `${timeValue}:00`.substring(0, 8)
                  : "";
                setNuevoEmpleado({ ...nuevoEmpleado, horafin: formattedTime });
              }}
            />

            <label>Asignación</label>
            <select
              value={nuevoEmpleado.role_id}
              onChange={(e) =>
                setNuevoEmpleado({ ...nuevoEmpleado, role_id: e.target.value })
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

            <label>Días que NO trabaja</label>
            <Calendar
              onClickDay={handleDayClick}
              tileClassName={({ date }) =>
                diasNoTrabaja.includes(date.toISOString().split("T")[0])
                  ? "day-off"
                  : ""
              }
            />

            <div className="popup-buttons">
              <button className="btn-add" onClick={addOrUpdateEmpleado}>
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
};

export default AdminEmpleados;

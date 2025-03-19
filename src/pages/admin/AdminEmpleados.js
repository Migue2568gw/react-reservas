import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";

const AdminEmpleados = () => {
  const [showPopupAdd, setShowPopupAdd] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [empleadosList, setEmpleadosList] = useState([]);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    id: null,
    nombre: "",
    telefono: "",
    foto: "",
    role: "",
    fotoAntigua: "",
  });
  const [diasNoTrabaja, setDiasNoTrabaja] = useState([]);

  useEffect(() => {
    const fetchEmpleados = async () => {
      const { data, error } = await supabase.from("employees").select("*");
      if (error) {
        toast.error("Error al obtener empleados");
      } else {
        setEmpleadosList(data || []);
      }
    };

    fetchEmpleados();

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
      fotoAntigua: "",
      role: "",
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
          name: nuevoEmpleado.nombre,
          phone: nuevoEmpleado.telefono,
          photo_url: fotoUrl,
          role: nuevoEmpleado.role,
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
        start_time: "09:00",
        end_time: "21:00",
      }));
      await supabase.from("shifts").insert(shifts);

      setEmpleadosList(
        empleadosList.map((emp) =>
          emp.id === nuevoEmpleado.id
            ? {
                ...emp,
                name: nuevoEmpleado.nombre,
                phone: nuevoEmpleado.telefono,
                photo_url: fotoUrl,
                role: nuevoEmpleado.role,
                turnos: diasNoTrabaja,
              }
            : emp
        )
      );
    } else {
      const { data: empleado, error } = await supabase
        .from("employees")
        .insert([
          {
            name: nuevoEmpleado.nombre,
            phone: nuevoEmpleado.telefono,
            photo_url: fotoUrl,
            role: nuevoEmpleado.role,
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
        start_time: "09:00",
        end_time: "21:00",
      }));

      await supabase.from("shifts").insert(shifts);

      setEmpleadosList([
        ...empleadosList,
        { ...empleado, turnos: diasNoTrabaja },
      ]);
    }

    setShowPopupAdd(false);
    setNuevoEmpleado({
      id: null,
      nombre: "",
      telefono: "",
      foto: "",
      fotoAntigua: "",
      role: "",
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
      role: resultEmployee.role,
      foto: resultEmployee.photo_url,
      fotoAntigua: resultEmployee.photo_url,
    });

    const { data: shifts } = await supabase
      .from("shifts")
      .select("day")
      .eq("employee_id", idEmpleado);

    setDiasNoTrabaja(shifts?.map((s) => s.day) || []);
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
          />
        </div>

        {empleadosList.map((empleado) => (
          <div
            key={empleado.id}
            className="AdContent-item"
            onClick={() => handleModificarEmpleado(empleado.id)}
          >
            {empleado.photo_url && (
              <img src={empleado.photo_url} alt="Empleado" width={100} />
            )}
            <p>Nombre: {empleado.name}</p>
            <p>Teléfono: {empleado.phone}</p>
            <p>Asignacion: {empleado.role}</p>
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
            <label>Teléfono</label>
            <input
              type="text"
              value={nuevoEmpleado.telefono}
              onChange={(e) =>
                setNuevoEmpleado({ ...nuevoEmpleado, telefono: e.target.value })
              }
            />
            <label>Asignación</label>
            <input
              type="text"
              value={nuevoEmpleado.role}
              onChange={(e) =>
                setNuevoEmpleado({ ...nuevoEmpleado, role: e.target.value })
              }
            />
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

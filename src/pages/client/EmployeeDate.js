import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Calendar from "react-calendar";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EmployeeDate() {
  const location = useLocation();
  const navigate = useNavigate();
  const empleado = location.state?.empleado;
  const { user } = useAuth();

  // Estado de las citas
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);

  if (!empleado) {
    navigate("/");
    return null;
  }

  const workHours = empleado ? {
    start: empleado.start_time,
    end: empleado.end_time,
  } : {
    start: "",
    end: "",
  };

  const availableTimes = generateAvailableTimes(workHours.start, workHours.end);

  // Función para generar horarios disponibles según el rango
  function generateAvailableTimes(startTime, endTime) {
    const times = [];
    let currentTime = new Date();
    let [startHour, startMinute] = startTime.split(":");
    let [endHour, endMinute] = endTime.split(":");

    currentTime.setHours(startHour, startMinute);

    while (
      currentTime.getHours() < endHour ||
      (currentTime.getHours() === endHour &&
        currentTime.getMinutes() < endMinute)
    ) {
      let hours = currentTime.getHours().toString().padStart(2, "0");
      let minutes = currentTime.getMinutes().toString().padStart(2, "0");
      times.push(`${hours}:${minutes}`);
      currentTime.setMinutes(currentTime.getMinutes() + 30); 
    }

    return times;
  }

  // Opciones de servicios (pueden ser más según el empleado)
  const services = [
    { value: "corte", label: "Corte de cabello" },
    { value: "afeitado", label: "Afeitado" },
    { value: "color", label: "Cambio de color" },
  ];

  // Manejar la selección de fecha
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Manejar la selección de hora
  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  // Manejar la selección de servicios
  const handleServicesChange = (selectedOptions) => {
    setSelectedServices(selectedOptions);
  };

  // Confirmar agendamiento
  const handleScheduleAppointment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    // Aquí iría el código para enviar los datos a tu backend
    toast.success("¡Cita agendada con éxito!");
  };

  return (
    <div className="barber-date-container">
      <ToastContainer />
      <div className="barber-details">
        <h1>{empleado.name}</h1>
        <div className="image-container">
          <img src={empleado.photo_url} alt={empleado.name} />
        </div>
      </div>

      <div className="schedule-section">
        {user ? (
          <>
            <div className="details-section">            
              <div className="calendar-container">
              <h3>Selecciona una fecha</h3>
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  minDate={new Date()}
                  className="dating-calendar"
                  tileClassName={({ date, view }) => {
                    const today = new Date();
                    today.setDate(today.getDate() - 1);
                    if (view === "month" && date < today) {
                      return "past-day";
                    }
                    return null;
                  }}
                />
              </div>

              {selectedDate && (
                <div className="selection-container">
                  <h2>Selecciona una hora</h2>
                  <Select
                    options={availableTimes.map((time) => ({
                      value: time,
                      label: time,
                    }))}
                    onChange={(option) => handleTimeChange(option?.value)}
                    value={
                      selectedTime
                        ? { value: selectedTime, label: selectedTime }
                        : null
                    }
                    isSearchable={false}
                    classNamePrefix="select"
                    className="custom-select"
                  />

                  {selectedTime && (
                    <>
                      <h2>Selecciona los servicios</h2>
                      <Select
                        isMulti
                        options={services}
                        onChange={handleServicesChange}
                        value={selectedServices}
                        isSearchable={false}
                        classNamePrefix="select"
                        className="custom-select"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
            <>
              {selectedServices.length > 0 && selectedDate && selectedTime && (
                <div className="details-section">
                  <div className="resume-section">
                    <h3>Resumen de tu cita</h3>
                    <div className="resume-info">
                      <p>
                        <strong>Especialista:</strong> {empleado.name}
                      </p>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {selectedDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="resume-info">
                      <p>
                        <strong>Hora inicio:</strong> {selectedTime}
                      </p>
                      <p>
                        <strong>Hora fin:</strong> {selectedTime}
                      </p>
                    </div>
                    <div className="resume-info">
                      <p>
                        <strong>Servicios:</strong>{" "}
                        {selectedServices
                          .map((service) => service.label)
                          .join(", ")}
                      </p>
                    </div>
                    <button
                      className="btnAdd"
                      onClick={handleScheduleAppointment}
                    >
                      Confirmar Cita
                    </button>
                  </div>
                </div>
              )}
            </>
          </>
        ) : (
          <div className="no-auth">
            <p>Debes iniciar sesión para agendar una cita.</p>
            <div className="btn-ok">
            <button className="btnOk" onClick={() => navigate("/login")}>
              Ingresar
            </button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeDate;

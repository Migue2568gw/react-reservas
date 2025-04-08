import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Calendar from "react-calendar";
import Select from "react-select";
import { toast } from "sonner";
import { supabase } from "../../supabase/client";
import LoadingScreen from "../../components/LoadingScreen";

function EmployeeDate() {
  const location = useLocation();
  const navigate = useNavigate();
  const empleado = location.state?.empleado;
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [temporarilyReserved, setTemporarilyReserved] = useState(null);
  const [reservationTimer, setReservationTimer] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    return () => {
      if (reservationTimer) clearTimeout(reservationTimer);
      if (temporarilyReserved) {
        releaseReservation(temporarilyReserved);
      }
    };
  }, [reservationTimer, temporarilyReserved]);

  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!empleado || !selectedDate) return;

      const times = await generateAvailableTimes(
        workHours.start,
        workHours.end,
        selectedDate,
        selectedServices
      );

      setAvailableTimes(times);
    };

    fetchAvailableTimes();
  }, [selectedDate, selectedServices, empleado]);

  const workHours = empleado
    ? {
        start: empleado.start_time,
        end: empleado.end_time,
      }
    : {
        start: "",
        end: "",
      };

  async function generateAvailableTimes(
    startTime,
    endTime,
    selectedDate,
    selectedServices = []
  ) {
    if (!selectedDate || !startTime || !endTime) return [];

    const times = [];
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 30 * 60000);
    const isToday = selectedDate.toDateString() === now.toDateString();

    const totalDuration = selectedServices.reduce((acc, service) => {
      const servicio = empleado.roles.subservices.find(
        (s) => s.name.toUpperCase() === service.label
      );
      return acc + (servicio ? parseInt(servicio.duration) : 0);
    }, 0);

    const { data: existingAppointments, error } = await supabase
      .from("appointments")
      .select("start_time, end_time")
      .eq("employee_id", empleado.id)
      .eq("date", selectedDate.toISOString().split("T")[0]);

    const { data: tempReservations, error: tempError } = await supabase
      .from("temporary_reservations")
      .select("start_time, end_time")
      .eq("employee_id", empleado.id)
      .eq("date", selectedDate.toISOString().split("T")[0])
      .gt("expires_at", new Date().toISOString());

    if (error || tempError) {
      console.error("Error fetching blocked times:", error || tempError);
      return [];
    }

    const allBlockedTimes = [
      ...existingAppointments,
      ...(tempReservations || []),
    ];

    let [startHour, startMinute] = startTime.split(":");
    let [endHour, endMinute] = endTime.split(":");

    const startTimeDate = new Date(selectedDate);
    startTimeDate.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

    const endTimeDate = new Date(selectedDate);
    endTimeDate.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    const maxEndTime = new Date(endTimeDate.getTime() + 20 * 60000);

    let currentTime = isToday
      ? new Date(Math.max(startTimeDate.getTime(), bufferTime.getTime()))
      : new Date(startTimeDate);

    while (currentTime < endTimeDate) {
      const potentialEndTime = new Date(
        currentTime.getTime() + totalDuration * 60000
      );

      if (potentialEndTime <= maxEndTime) {
        const timeStr = currentTime.toTimeString().slice(0, 5);
        const endStr = potentialEndTime.toTimeString().slice(0, 5);

        const isAvailable = !allBlockedTimes.some((appt) => {
          const apptStart = new Date(selectedDate);
          const [apptStartHour, apptStartMin] = appt.start_time.split(":");
          apptStart.setHours(apptStartHour, apptStartMin, 0, 0);

          const apptEnd = new Date(selectedDate);
          const [apptEndHour, apptEndMin] = appt.end_time.split(":");
          apptEnd.setHours(apptEndHour, apptEndMin, 0, 0);

          return (
            (currentTime >= apptStart && currentTime < apptEnd) ||
            (potentialEndTime > apptStart && potentialEndTime <= apptEnd) ||
            (currentTime <= apptStart && potentialEndTime >= apptEnd)
          );
        });

        if (isAvailable) {
          times.push({
            value: timeStr,
            label: timeStr,
            end: endStr,
            duration: totalDuration,
          });
        }
      }

      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return times;
  }

  const services =
    empleado.roles?.subservices?.map((servicio) => ({
      value: servicio.name.toUpperCase().replace(/\s+/g, "_"),
      label: servicio.name.toUpperCase(),
      duration: servicio.duration,
      id: servicio.id,
    })) || [];

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    if (temporarilyReserved) {
      clearTimeout(reservationTimer);
      releaseReservation(temporarilyReserved);
      setTemporarilyReserved(null);
    }
  };

  const releaseReservation = async (reservation) => {
    try {
      await supabase
        .from("temporary_reservations")
        .delete()
        .eq("employee_id", reservation.employee_id)
        .eq("date", reservation.date)
        .eq("start_time", reservation.start_time);
    } catch (error) {
      console.error("Error releasing reservation:", error);
    }
  };

  const handleTimeChange = async (option) => {
    if (!option) {
      setSelectedTime(null);
      return;
    }

    if (!option.value || !option.end) {
      toast.error("El horario seleccionado no tiene información completa");
      return;
    }

    if (temporarilyReserved) {
      clearTimeout(reservationTimer);
      await releaseReservation(temporarilyReserved);
    }

    try {
      const reservation = {
        employee_id: empleado.id,
        date: selectedDate.toISOString().split("T")[0],
        start_time: option.value,
        end_time: option.end,
        user_id: user?.id || null,
        expires_at: new Date(Date.now() + 4 * 60 * 1000).toISOString(),
      };

      console.log("Intentando reservar:", reservation);

      const { error } = await supabase
        .from("temporary_reservations")
        .insert([reservation]);

      if (error) throw error;

      setTemporarilyReserved(reservation);
      setSelectedTime(option.value);

      const timer = setTimeout(() => {
        if (temporarilyReserved) {
          releaseReservation(temporarilyReserved);
          setTemporarilyReserved(null);
          if (selectedTime === option.value) {
            setSelectedTime(null);
            toast.warning("El tiempo de reserva ha expirado");
          }
        }
      }, 4 * 60 * 1000);

      setReservationTimer(timer);
    } catch (error) {
      console.error("Error en reserva:", error);
      toast.error(`Error al reservar: ${error.message}`);
    }
  };

  const handleServicesChange = (selectedOptions) => {
    setSelectedServices(selectedOptions);
  };

  const calcularHoraFin = () => {
    if (!selectedTime || selectedServices.length === 0) return selectedTime;

    const totalMinutos = selectedServices.reduce((acc, service) => {
      return acc + parseInt(service.duration);
    }, 0);

    const [hour, minute] = selectedTime.split(":").map(Number);
    const fin = new Date();
    fin.setHours(hour, minute + totalMinutos);

    return fin.toTimeString().slice(0, 5);
  };

  const handleScheduleAppointment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    if (temporarilyReserved) {
      await releaseReservation(temporarilyReserved);
      setTemporarilyReserved(null);
      clearTimeout(reservationTimer);
    }

    const endTime = calcularHoraFin();

    const [endHour, endMinute] = workHours.end.split(":").map(Number);
    const maxEndTime = new Date();
    maxEndTime.setHours(endHour, endMinute + 20, 0, 0);

    const [finHour, finMinute] = endTime.split(":").map(Number);
    const finTime = new Date();
    finTime.setHours(finHour, finMinute, 0, 0);

    if (finTime > maxEndTime) {
      toast.error(
        "Los servicios seleccionados exceden nuestro horario permitido."
      );
      return;
    }

    setLoading(true);

    try {
      if (temporarilyReserved) {
        await releaseReservation(temporarilyReserved);
        setTemporarilyReserved(null);
        clearTimeout(reservationTimer);
      }

      const { data: conflictingAppointments, error: conflictError } =
        await supabase
          .from("appointments")
          .select()
          .eq("employee_id", empleado.id)
          .eq("date", selectedDate.toISOString().split("T")[0])
          .lt("start_time", endTime)
          .gt("end_time", selectedTime);

      if (conflictError) throw conflictError;

      if (conflictingAppointments.length > 0) {
        toast.error(
          "El empleado ya tiene una cita en este horario. Por favor, elige otro horario."
        );
        return;
      }

      const { error: appointmentError } = await supabase
        .from("appointments")
        .insert([
          {
            employee_id: empleado.id,
            user_id: user.id,
            date: selectedDate.toISOString().split("T")[0],
            start_time: selectedTime,
            end_time: endTime,
            status: "scheduled",
          },
        ])
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      toast.success("¡Cita agendada con éxito!");
      navigate("/miscitas");
    } catch (error) {
      console.error("Error al agendar cita:", error);
      toast.error("Error al agendar la cita. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!empleado) {
    navigate("/");
    return null;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="barber-date-container">
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
                    options={availableTimes}
                    onChange={handleTimeChange}
                    value={availableTimes.find(
                      (opt) => opt.value === selectedTime
                    )}
                    getOptionValue={(option) => option.value}
                    isOptionDisabled={(option) => option.isDisabled}
                    isSearchable={false}
                    classNamePrefix="select"
                    className="custom-select"
                    placeholder="Selecciona una hora"
                  />

                  {selectedTime && (
                    <>
                      <h2>Selecciona los servicios</h2>
                      <Select
                        isMulti
                        options={services || []}
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
                        <strong>Hora fin:</strong> {calcularHoraFin()}
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

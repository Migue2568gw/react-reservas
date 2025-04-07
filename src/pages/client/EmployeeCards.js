import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { supabase } from "../../supabase/client";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

function EmployeeCards() {
  const [empleadosList, setEmpleadosList] = useState([]);

  useEffect(() => {
    const fetchEmpleados = async () => {
      const { data, error } = await supabase.from("employees").select(`
          *,
          roles (
            name,
            subservices (name, duration, price)
          ),
          shifts (day)
        `);

      if (error) {
        toast.error("Error al obtener empleados");
        return;
      }

      setEmpleadosList(data || []);
    };

    fetchEmpleados();
  }, []);

  return (
    <>
      <h1 className="heading">Nuestro Equipo</h1>
      {empleadosList.length > 0 && (
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          slidesPerView={"auto"}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 150,
            modifier: 2.5,
            slideShadows: false,
          }}
          modules={[EffectCoverflow, Pagination, Navigation]}
          className="swiper_container"
        >
          {empleadosList.map((empleado) => {
            const esEspecialista = ["barbero", "manicurista"].includes(
              empleado.roles.name.toLowerCase()
            );

            const tieneServicios =
              empleado.roles?.subservices &&
              empleado.roles.subservices.length > 0;

            if (!esEspecialista) return null;

            const handleClick = (e) => {
              if (!tieneServicios) {
                e.preventDefault();
                toast.info(
                  "Nuestro especialista no tiene servicios para brindarte"
                );
              }
            };

            return (
              <SwiperSlide key={empleado.id}>
                <Link to="/empleado" state={{ empleado }} onClick={handleClick}>
                  <img src={empleado.photo_url} alt={empleado.name} />
                  <p className="barber-name">{empleado.name}</p>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </>
  );
}

export default EmployeeCards;

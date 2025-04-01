import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { supabase } from "../../supabase/client";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

function EmployeeCards() {
  const [empleadosList, setEmpleadosList] = useState([]);

  useEffect(() => {
    const fetchEmpleados = async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*, roles(name),shifts(day)");

      if (error) {
        toast.error("Error al obtener empleados");
      } else {
        setEmpleadosList(data || []);
      }
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
          {empleadosList.map(
            (empleado) =>
              ["barbero", "manicurista"].includes(
                empleado.roles.name.toLowerCase()
              ) && (
                <SwiperSlide key={empleado.id}>
                   <Link to="/empleado" state={{ empleado }}>
                    <img src={empleado.photo_url} alt={empleado.name} />
                    <p className="barber-name">{empleado.name}</p>
                  </Link>
                </SwiperSlide>
              )
          )}
        </Swiper>
      )}
    </>
  );
}

export default EmployeeCards;

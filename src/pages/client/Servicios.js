import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { supabase } from "../../supabase/client";
import { useAuth } from "../../context/AuthContext";

function Servicios() {
  const [activeService, setActiveService] = useState(null);
  const [serviciosList, setServiciosList] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchServiciosConSubServicios = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*, subservices(*, roles(name))");

      if (error) {
        toast.error("Error al obtener servicios y subservicios");
      } else {
        setServiciosList(data || []);
      }
    };

    fetchServiciosConSubServicios();
  }, []);

  const handleServiceClick = (serviceId) => {
    setActiveService(activeService === serviceId ? null : serviceId);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleMessage = ()=>{
    if(user){
      toast.warning("Selecciona a uno de nuestros especialistas para agendar.")
    }else{
      toast.warning("Inicia sesión para agendar con nosotros.")
    }
  }

  return (
    <div className="services-container">
      <h1 className="heading">Nuestros Servicios</h1>

      <div className="services-list">
        {serviciosList.map((service) => (
          <div key={service.id}>
            <button
              className={`service-button ${
                activeService === service.id ? "active" : ""
              }`}
              onClick={() => handleServiceClick(service.id)}
            >
              {service.name.toUpperCase()}
            </button>

            {activeService === service.id && (
              <div className="subservices-container">
                {service.subservices && service.subservices.length > 0 ? (
                  service.subservices.map((sub) => (
                    <div key={sub.id} className="subservice-item" onClick={() => handleMessage()}>
                      <div className="subservice-name">{sub.name.toUpperCase()}</div>
                      <div className="subservice-details">
                        <span>{sub.duration} MIN</span>
                        <span className="subservice-price">
                          {formatPrice(sub.price)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No hay subservicios disponibles</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Servicios;

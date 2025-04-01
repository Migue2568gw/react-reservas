import React, { useEffect, useState } from "react";
import EmployeeCards from "./EmployeeCards";
import Servicios from "./Servicios";
import caramel from "../../assets/images/caramel.png";

function Client() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout); 
  }, []);

    if (isLoading) {
      return (
        <div className="loading-container">
          <img src={caramel} alt="Logo de la barbería" className="loading-logo" />
        </div>
      );
    }

  return (
    <div className="container">
      <EmployeeCards />
      <Servicios />
    </div>
  );
}

export default Client;

import React, { useEffect, useState } from "react";
import EmployeeCards from "./EmployeeCards";
import Servicios from "./Servicios";
import LoadingScreen from "../../components/LoadingScreen";

function Client() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout); 
  }, []);

    if (isLoading) {
      return <LoadingScreen />;
    }

  return (
    <div className="container">
      <EmployeeCards />
      <Servicios />
    </div>
  );
}

export default Client;

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./styles/style.css";
import "./styles/styleMovile.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ToastContainer
        position="bottom-right"
        autoClose={1500}
        hideProgressBar={false}     
      />
      </AuthProvider>
    </BrowserRouter>
);

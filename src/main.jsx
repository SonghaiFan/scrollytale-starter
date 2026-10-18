import React from "react";
import { createRoot } from "react-dom/client";
import "visdelta/style.css";
import "./styles.css";
import { App } from "./components/App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

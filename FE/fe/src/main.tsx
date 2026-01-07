(window as any).global = window;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "antd/dist/reset.css";
import App from "./app/App";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("Service Worker registered"))
      .catch(err => console.error("SW registration failed", err));
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

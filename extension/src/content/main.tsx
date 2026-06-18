import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./views/App.tsx";
import "../lib/logo.tsx";
import "../lib/theme.tsx";
import "../lib/testcase.tsx";

console.log("[CF-Litening] We hope your'e enjoying the extension!");

const container = document.createElement("div");
container.id = "cf-Litening";
document.body.appendChild(container);

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

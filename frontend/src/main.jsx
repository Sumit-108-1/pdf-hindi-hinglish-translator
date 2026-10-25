import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import HindiTest from "./HindiTest.jsx";

const isHindiTest =
  new URLSearchParams(window.location.search).get("test") === "hindi";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isHindiTest ? <HindiTest /> : <App />}
  </StrictMode>
);

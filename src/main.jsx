import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./context/ThemeContext";
import { RoleProvider } from "./context/RoleContext";
import { ProjectProvider } from "./context/ProjectContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <RoleProvider>
        <ProjectProvider>
          <BrowserRouter>
            <TooltipProvider delayDuration={200}>
              <App />
            </TooltipProvider>
          </BrowserRouter>
        </ProjectProvider>
      </RoleProvider>
    </ThemeProvider>
  </StrictMode>
);

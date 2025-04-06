import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "./components/ui/toaster";
import { ProjectProvider } from "./context/ProjectContext";

// Add Inter font
const inter = document.createElement("link");
inter.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
inter.rel = "stylesheet";
document.head.appendChild(inter);

// Add DM Sans font
const dmSans = document.createElement("link");
dmSans.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap";
dmSans.rel = "stylesheet";
document.head.appendChild(dmSans);

// Add JetBrains Mono font
const jetbrainsMono = document.createElement("link");
jetbrainsMono.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap";
jetbrainsMono.rel = "stylesheet";
document.head.appendChild(jetbrainsMono);

// Add Boxicons
const boxicons = document.createElement("link");
boxicons.href = "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css";
boxicons.rel = "stylesheet";
document.head.appendChild(boxicons);

// Set page title
document.title = "ATMosFera - ATMF Insight Navigator";

createRoot(document.getElementById("root")!).render(
  <>
    <ProjectProvider>
      <App />
      <Toaster />
    </ProjectProvider>
  </>
);

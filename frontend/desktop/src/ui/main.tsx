import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider } from "@contexts/AuthContext";
import { RouterProvider } from "react-router";
import { router } from "./router";
import { ConfirmProvider } from "@contexts/ConfirmContext";

createRoot(document.getElementById("root")!).render(
  <ConfirmProvider>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </ConfirmProvider>,
);

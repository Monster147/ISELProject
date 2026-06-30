import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider } from "@contexts/AuthContext";
import { RouterProvider } from "react-router";
import { router } from "./router";
import { ConfirmProvider } from "@contexts/ConfirmContext";

/**
 * Ponto de entrada da interface desktop (Electron + React).
 * Monta a aplicação no elemento `#root`, envolvendo-a nos providers de confirmação e de
 * autenticação e fornecendo o router à árvore via `RouterProvider`.
 */
createRoot(document.getElementById("root")!).render(
  <ConfirmProvider>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </ConfirmProvider>,
);

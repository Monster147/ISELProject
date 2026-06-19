import { createBrowserRouter } from "react-router";
import Home from "./app/Home";
import Login from "./app/(auth)/Login";
import Register from "./app/(auth)/Register";
import AuthLayout from "./app/(auth)/authLayout";
import RootLayout from "./app/rootLayout";
import DashboardLayout from "./app/(dashboard)/dashboardLayout";
import IntervenorSearch from "./app/(dashboard)/intervenor";
import Profile from "./app/(dashboard)/profile";
import OccurrenceDetails from "./app/(dashboard)/occurrences/[id]";
import OccurrenceIntervenors from "./app/(dashboard)/occurrences/intervenors/[id]";
import IntervenorCreate from "./app/(dashboard)/intervenors/create";
import IntervenorUpdate from "./app/(dashboard)/intervenors/update";
import "../../i18next/i18next";
import "@utils/ConfigureApiDesktop";
import Loadingscreen from "./app/loadingscreen";
import Documents from "./app/(dashboard)/documents";
import DynamicOccurrenceForm from "./app/(dashboard)/occurrences/evidences/[id]";
import Dashboard from "./app/(dashboard)/dashboard";
import OccurrenceScreen from "./app/(dashboard)/occurrence";
import OccurrenceReport from "./app/(dashboard)/occurrences/report/[id]";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Loadingscreen /> },
      { path: "/home", element: <Home /> },
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Register /> },
        ],
      },
      {
        element: <DashboardLayout />,
        children: [
          { path: "/intervenor", element: <IntervenorSearch /> },
          { path: "/profile", element: <Profile /> },
          { path: "/occurrence", element: <OccurrenceScreen /> },
          { path: "/documents", element: <Documents /> },
          { path: "/occurrence/:id", element: <OccurrenceDetails /> },
          {
            path: "/occurrence/intervenors/:occurrenceId",
            element: <OccurrenceIntervenors />,
          },
          { path: "/intervenor/create", element: <IntervenorCreate /> },
          {
            path: "/intervenor/update/:intervenorId",
            element: <IntervenorUpdate />,
          },
          {
            path: "/intervenor/:selectMode/:occurrenceId",
            element: <IntervenorSearch />,
          },
          {
            path: "/occurrence/evidences/:occurrenceId",
            element: <DynamicOccurrenceForm />,
          },
          { path: "/dashboard", element: <Dashboard /> },
          {
            path: "occurrence/report/:occurrenceId",
            element: <OccurrenceReport />,
          },
        ],
      },
    ],
  },
]);

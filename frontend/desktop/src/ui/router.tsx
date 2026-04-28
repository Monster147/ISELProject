import {createBrowserRouter} from "react-router";
import Home from "./components/Home";
import Login from "./components/(auth)/Login";
import Register from "./components/(auth)/Register";
import AuthLayout from "./components/(auth)/authLayout";
import RootLayout from "./components/rootLayout";
import DashboardLayout from "./components/(dashboard)/dashboardLayout";
import Intervenor from "./components/(dashboard)/intervenor";
import IntervenorSearch from "./components/(dashboard)/intervenor";
import Profile from "./components/(dashboard)/profile";
import Occurrence from "./components/(dashboard)/occurrence";
import OccurrenceDetails from "./components/(dashboard)/occurrences/[id]";
import OccurrenceIntervenors from "./components/(dashboard)/occurrences/intervenors/[id]";
import IntervenorCreate from "./components/(dashboard)/intervenors/create";
import IntervenorUpdate from "./components/(dashboard)/intervenors/update";
import "../../i18next/i18next";
import "./utils/ConfigureApiDesktop"
import Loadingscreen from "./components/loadingscreen";
import Documents from "./components/(dashboard)/documents";
import OccurrenceEvidences from "./components/(dashboard)/occurrences/evidences/[id]";

export const router = createBrowserRouter([
    {
        element: <RootLayout/>,
        children: [
            {path:"/", element: <Loadingscreen/>},
            {path: "/home", element: <Home/>},
            {
                element: <AuthLayout/>,
                children: [
                    {path: "/login", element: <Login/>},
                    {path: "/register", element: <Register/>},
                ],
            },
            {
                element: <DashboardLayout/>,
                children: [
                    {path: "/intervenor", element: <IntervenorSearch/>},
                    {path: "/profile", element: <Profile/>},
                    {path: "/occurrence", element: <Occurrence/>},
                    {path: "/documents", element: <Documents/>},
                    {path: "/occurrence/:id", element: <OccurrenceDetails/>},
                    {path: "/occurrence/intervenors/:occurrenceId", element: <OccurrenceIntervenors/>},
                    {path: "/intervenor/create", element: <IntervenorCreate/>},
                    {path: "/intervenor/update/:intervenorId", element: <IntervenorUpdate/>},
                    {path: "/intervenor/:selectMode/:occurrenceId", element: <IntervenorSearch/>},
                    {path: "/occurrence/evidences/:occurrenceId", element: <OccurrenceEvidences/>}
                ]
            },
        ],
    },
]);
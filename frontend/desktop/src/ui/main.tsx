import { createRoot } from 'react-dom/client'
import './index.css'
import {AuthProvider} from "./contexts/AuthContext";
import {RouterProvider} from "react-router";
import {router} from "./router";

createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <RouterProvider router={router}/>
    </AuthProvider>
)

import {createBrowserRouter} from "react-router";
import {Home} from "./components/Home";
import {Login} from "./components/Login";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home/>,
        children: [
            {
                path: "login",
                element: <Login/>
            },
        ],
    },
]);
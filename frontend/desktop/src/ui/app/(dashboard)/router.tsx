import { createBrowserRouter } from "react-router";
import Home from "../Home";
import Login from "../(auth)/Login";
import Register from "../(auth)/Register";
import AuthLayout from "../(auth)/authLayout";
import RootLayout from "../rootLayout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Register /> },
        ],
      },
    ],
  },
]);

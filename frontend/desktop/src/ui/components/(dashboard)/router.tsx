import { createBrowserRouter } from "react-router";
import Home from "./components/Home";
import Login from "./components/(auth)/Login";
import Register from "./components/(auth)/Register";
import AuthLayout from "./components/(auth)/authLayout";
import RootLayout from "./components/rootLayout";

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

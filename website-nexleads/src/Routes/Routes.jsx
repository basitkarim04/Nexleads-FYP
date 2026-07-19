import React from "react";
import { useRoutes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Landing from "../pages/Landing";
import AuthPages from "../pages/LoginSignup";
import AdminPanel from "../pages/admin";
import { AdminRoute, UserRoute } from "./ProtectedRoutes";

const AppRoutes = () => {
  const routes = [
    {
      path: "/login",
      element: <AuthPages />,
    },
    {
      path: "/",
      element: <Landing />,
    },
    {
      element: <UserRoute />,
      children: [
        {
          path: "/dashboard",
          element: <Dashboard />,
        }
      ]

    },
    {
      element: <AdminRoute />,
      children: [
        {
          path: "/admin-dashboard",
          element: <AdminPanel />,
        }
      ]
    }
  ];

  return useRoutes(routes);
};

export default AppRoutes;

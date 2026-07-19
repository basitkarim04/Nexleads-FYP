import { Navigate, Outlet } from "react-router-dom";

export const AdminRoute = () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("userData");

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  try {
    const parsedUser = JSON.parse(userData);

    if (parsedUser.type !== "Admin") {
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  } catch (err) {
    return <Navigate to="/login" replace />;
  }
};
export const UserRoute = () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("userData");

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  try {
    const parsedUser = JSON.parse(userData);

    if (parsedUser.type !== "User") {
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  } catch (err) {
    return <Navigate to="/login" replace />;
  }
};

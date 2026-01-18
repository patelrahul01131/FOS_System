import { Navigate } from "react-router-dom";

export default function Protected({ children, role }) {
  const token = localStorage.getItem("token");
  const r = localStorage.getItem("role");
  if (!token || r !== role) return <Navigate to={`/${role}`} />;
  return children;
}

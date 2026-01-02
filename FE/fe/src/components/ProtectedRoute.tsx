import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: any) {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" />;
  return children;
}

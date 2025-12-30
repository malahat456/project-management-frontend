import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { auth } = useContext(AuthContext);

  if (!auth) return <p>Unauthorized</p>;
  if (role && auth.role !== role) return <p>Access denied</p>;

  return children;
}

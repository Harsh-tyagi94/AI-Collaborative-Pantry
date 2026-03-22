import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props) => {
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth,
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0b0b0f] text-white">
        <p>Loading Auth State...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Result: Redirecting to Login");
    return <Navigate to="/login" replace />;
  }

  return <>{ children }</>;
};

export default ProtectedRoute;
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const PublicRoute = ({ children }: Props) => {
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth,
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0b0b0f]">
        <p className="text-indigo-500 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{ children }</>;
};

export default PublicRoute
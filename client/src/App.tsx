import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CreateRoomPage from "./pages/CreateRoomPage";
import PantryRoomPage from "./pages/PantryRoomPage";
import { Toaster } from "@/components/ui/sonner";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { logout, setAuthLoad, setUser } from "./store/slices/authSlice";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import type { RootState } from "./store/store";

function App() {
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const initialAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        dispatch(logout());
        dispatch(setAuthLoad());
        return;
      }

      try {
        const fetchUser = await fetch(
          "http://localhost:8000/api/v1/users/aboutme",
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const result = await fetchUser.json();
        console.log(result)
        if (fetchUser.ok && result.data) {
          dispatch(setUser(result.data));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        dispatch(logout());
      } finally {
        dispatch(setAuthLoad());
      }
    };

    initialAuth();
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-room"
          element={
            <ProtectedRoute>
              <CreateRoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <PantryRoomPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;

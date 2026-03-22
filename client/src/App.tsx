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
import GetRoomHistory from "./components/RoomPageComponent/GetRoomHistory";
import HistoryRoomRecipe from "./components/RoomPageComponent/HistoryRoomRecipe";
import { getCurrentUserApi } from "./api/auth/auth.api";

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
        const data = await getCurrentUserApi();

        if (data?.data) {
          dispatch(setUser(data.data));
        } else {
          dispatch(logout());
        }
      } catch (error: any) {
        if (error.status === 401) {
          dispatch(logout());
        } else {
          console.error("Auth init error:", error.message);
        }
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
        <Route
          path="/room/gethistory"
          element={
            <ProtectedRoute>
              <GetRoomHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room/:roomId/recipe"
          element={
            <ProtectedRoute>
              <HistoryRoomRecipe />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;

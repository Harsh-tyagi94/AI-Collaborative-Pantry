import { Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/dashboardPage";
import RegisterPage from "./pages/registerPage";
import LoginPage from "./pages/loginPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;

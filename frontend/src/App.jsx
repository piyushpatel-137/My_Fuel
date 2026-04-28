import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Bikes from "./pages/Bikes.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Fuel from "./pages/Fuel.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-700">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bikes" element={<Bikes />} />
        <Route path="fuel" element={<Fuel />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

export default App;


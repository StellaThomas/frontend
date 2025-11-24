// import React from "react";
// import AdminDashboard from "./pages/Admindashboard";

// const App = () => {
//   return <AdminDashboard />;
// };

// export default App;







import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/Admindashboard";
import OrdersPage from "./pages/OrderPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/orders" element={<OrdersPage />} />
    </Routes>
  );
}
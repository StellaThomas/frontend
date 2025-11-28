





// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import LoginPage from "./pages/LoginPage";
// import DashboardPage from "./pages/Admindashboard";
// import OrdersPage from "./pages/OrderPage";

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to="/login" />} />
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/dashboard" element={<DashboardPage />} />
//       <Route path="/orders" element={<OrdersPage />} />
      
//     </Routes>
//   );
// }






























// App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/Admindashboard";
import OrdersPage from "./pages/OrderPage";
import CSVCreatorWithPreview from "./pages/Createcsv"; // <-- CSV component
import CsvPreviewPage from "./pages/CsvPreviewPage"; // <-- CSV Preview component
import AcceptedOrdersPage from "./pages/AcceptedOrderpage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/create-csv" element={<CSVCreatorWithPreview open={true} onClose={() => { /* handled inside page or use a wrapper */ }} />} />
       <Route path="/csv-preview" element={<CsvPreviewPage />} />
      <Route path="/accepted-orders" element={<AcceptedOrdersPage />} />
    </Routes>
  );
}

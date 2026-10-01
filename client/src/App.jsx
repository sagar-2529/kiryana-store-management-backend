import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { session } from "./api/client";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import CustomersPage from "./pages/CustomersPage";
import BillingPage from "./pages/BillingPage";

function Protected({ children }) { return session.token() ? children : <Navigate to="/login" replace />; }

export default function App() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route path="/" element={<Protected><DashboardPage /></Protected>} /><Route path="/inventory" element={<Protected><InventoryPage /></Protected>} /><Route path="/customers" element={<Protected><CustomersPage /></Protected>} /><Route path="/billing" element={<Protected><BillingPage /></Protected>} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}

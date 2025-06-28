import { Header } from "@/components/Header";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Dashboard } from "@/pages/Dashboard";
import { HomePage } from "@/pages/HomePage";
import { CustomersPage } from "@/pages/CustomersPage";
import { InventoryPage } from "@/pages/InventoryPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { CustomerDetailPage } from "@/pages/CustomerDetailPage";
import { TransactionsPage } from "@/pages/TransactionsPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/add"
            element={
              <ProtectedRoute allowedRoles="owner">
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/pending"
            element={
              <ProtectedRoute allowedRoles="owner">
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/history"
            element={
              <ProtectedRoute>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles="owner">
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles="owner">
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/details/:customerId"
            element={
              <ProtectedRoute allowedRoles="owner">
                <CustomerDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:customerId/transactions"
            element={
              <ProtectedRoute allowedRoles="owner">
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
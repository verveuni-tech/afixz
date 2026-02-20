import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./src/components/common/Navbar";
import Footer from "./src/components/common/Footer";

import Home from "./src/pages/Home";
import ServiceDetail from "./src/pages/ServiceDetail";

import AdminLogin from "./src/pages/admin/AdminLogin";
import AdminDashboard from "./src/pages/admin/AdminDashboard";
import AdminServices from "./src/pages/admin/AdminServices";

import ProtectedRoute from "./src/pages/admin/ProtectedRoute";
import CategoryServices from "./src/pages/CategoryServices";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <Routes>
        {/* PUBLIC ROUTES */}
        {!isAdminRoute && (
          <>
            <Route
              path="/"
              element={
                <AppLayout>
                  <Home />
                </AppLayout>
              }
            />

            <Route
              path="/services/:slug"
              element={
                <AppLayout>
                  <ServiceDetail />
                </AppLayout>
              }
            />
          </>
        )}

        {/* ADMIN ROUTES */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
  path="/category/:categorySlug"
  element={
    <AppLayout>
      <CategoryServices />
    </AppLayout>
  }
/>

        <Route
          path="/admin/services"
          element={
            <ProtectedRoute>
              <AdminServices />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
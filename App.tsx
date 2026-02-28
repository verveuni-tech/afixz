import { Routes, Route, Outlet } from "react-router-dom";

import Navbar from "./src/components/common/Navbar";
import Footer from "./src/components/common/Footer";

import Home from "./src/pages/Home";
import ServiceDetail from "./src/pages/ServiceDetail";
import CategoryServices from "./src/pages/CategoryServices";
import Profile from "./src/pages/Profile";
import Cart from "./src/pages/Cart";

import AdminLogin from "./src/pages/admin/AdminLogin";
import AdminDashboard from "./src/pages/admin/AdminDashboard";
import AdminServices from "./src/pages/admin/AdminServices";
import ProtectedRoute from "./src/pages/admin/ProtectedRoute";

import UserProtectedRoute from "./src/hooks/UserProtectedRoute";
import Checkout from "./src/pages/Checkout";
import BookingSuccess from "./src/pages/BookingSuccess";

/* ---------------- Layout ---------------- */

const AppLayout = () => {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

/* ---------------- App ---------------- */

function App() {
  return (
    <Routes>

      {/* PUBLIC ROUTES WITH LAYOUT */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/category/:categorySlug" element={<CategoryServices />} />
        <Route path="/profile" element={<Profile />} />

        {/* 🔐 USER PROTECTED ROUTE */}
        <Route
          path="/cart"
          element={
            <UserProtectedRoute>
              <Cart />
            </UserProtectedRoute>
          }
        />
  <Route
        path="/checkout"
        element={
          <UserProtectedRoute>
            <Checkout />
          </UserProtectedRoute>
        }
      />
<Route
        path="/checkout"
        element={
          <UserProtectedRoute>
            <Checkout />
          </UserProtectedRoute>
        }
      />
<Route
        path="/checkout"
        element={
          <UserProtectedRoute>
            <Checkout />
          </UserProtectedRoute>
        }
      />
      <Route
        path="/booking-success/:id"
        element={
          <UserProtectedRoute>
            <BookingSuccess />
          </UserProtectedRoute>
        }
      />

     

      </Route>
    
      {/* ADMIN LOGIN */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ADMIN PROTECTED */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
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
  );
}

export default App;
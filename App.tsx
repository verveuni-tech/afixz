import { Suspense, lazy } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import Navbar from "./src/components/common/Navbar";
import Footer from "./src/components/common/Footer";

import ProtectedRoute from "./src/pages/admin/ProtectedRoute";
import UserProtectedRoute from "./src/hooks/UserProtectedRoute";

const Home = lazy(() => import("./src/pages/Home"));
const ServiceDetail = lazy(() => import("./src/pages/ServiceDetail"));
const CategoryServices = lazy(() => import("./src/pages/CategoryServices"));
const Profile = lazy(() => import("./src/pages/Profile"));
const Cart = lazy(() => import("./src/pages/Cart"));
const Checkout = lazy(() => import("./src/pages/Checkout"));
const BookingSuccess = lazy(() => import("./src/pages/BookingSuccess"));
const ServicesPage = lazy(() => import("./src/pages/ServicesPage"));
const BlogsPage = lazy(() => import("./src/pages/BlogsPage"));
const BlogDetail = lazy(() => import("./src/pages/BlogDetail"));
const AdminLogin = lazy(() => import("./src/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./src/pages/admin/AdminDashboard"));
const AdminServices = lazy(() => import("./src/pages/admin/AdminServices"));

const AppLayout = () => {
  return (
    <div className="min-h-screen overflow-x-hidden font-sans">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:blogId" element={<BlogDetail />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/category/:categorySlug" element={<CategoryServices />} />
          <Route path="/profile" element={<Profile />} />

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
            path="/booking-success/:id"
            element={
              <UserProtectedRoute>
                <BookingSuccess />
              </UserProtectedRoute>
            }
          />
        </Route>

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
          path="/admin/services"
          element={
            <ProtectedRoute>
              <AdminServices />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-blue-100" />
        <p className="mt-5 text-base font-medium text-slate-800">Loading page</p>
        <p className="mt-2 text-sm text-slate-500">
          Preparing the next screen with the latest data.
        </p>
      </div>
    </div>
  );
}

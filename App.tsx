import { Suspense, lazy } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import Navbar from "./src/components/common/Navbar";
import Footer from "./src/components/common/Footer";
import LocationPickerModal from "./src/components/common/LocationPickerModal";

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
const AdminAllServices = lazy(() => import("./src/pages/admin/AdminAllServices"));

const AppLayout = () => {
  return (
    <div className="min-h-screen overflow-x-hidden font-sans">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <LocationPickerModal />
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

        <Route
          path="/admin/all-services"
          element={
            <ProtectedRoute>
              <AdminAllServices />
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.08),_transparent_30%)]" />

      <div
        role="status"
        aria-live="polite"
        className="relative w-full max-w-lg rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] backdrop-blur"
      >
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-200">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            <div className="absolute inset-0 animate-pulse rounded-2xl bg-white/10" />
          </div>

          <div className="flex-1 text-left">
            <p className="text-base font-semibold tracking-tight text-slate-900">
              Loading your page
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Fetching content and preparing the interface.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 space-y-3">
              <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-11/12 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 animate-[loader_1.2s_ease-in-out_infinite] rounded-full bg-blue-500" />
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Please wait
          </span>
        </div>
      </div>

      <style>
        {`
          @keyframes loader {
            0% { transform: translateX(-100%); width: 40%; }
            50% { transform: translateX(60%); width: 55%; }
            100% { transform: translateX(180%); width: 40%; }
          }
        `}
      </style>
    </div>
  );
}

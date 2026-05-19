import {
  Suspense,
  lazy,
  useEffect,
  useState,
  memo,
} from "react";

import {
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import Navbar from "./components/common/Navbar";
import BottomNav from "./components/common/BottomNav";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ScrollToTop from "./components/common/ScrollToTop";

import ProtectedRoute from "./pages/admin/ProtectedRoute";
import ProviderProtectedRoute from "./pages/provider/ProviderProtectedRoute";
import UserProtectedRoute from "./hooks/UserProtectedRoute";

import {
  completeEmailLinkSignIn,
  isEmailSignInUrl,
} from "./components/auth/AuthLogin";

/* ----------------------------- Lazy Components ----------------------------- */

const Footer = lazy(
  () => import("./components/common/Footer")
);

const LocationPickerModal = lazy(
  () => import("./components/common/LocationPickerModal")
);

const NotFound = lazy(
  () => import("./pages/NotFound")
);

const Home = lazy(
  () => import("./pages/Home")
);

const ServiceDetail = lazy(
  () => import("./pages/ServiceDetail")
);

const CategoryServices = lazy(
  () => import("./pages/CategoryServices")
);

const Profile = lazy(
  () => import("./pages/Profile")
);

const Cart = lazy(
  () => import("./pages/Cart")
);

const Checkout = lazy(
  () => import("./pages/Checkout")
);

const BookingSuccess = lazy(
  () => import("./pages/BookingSuccess")
);

const ServicesPage = lazy(
  () => import("./pages/ServicesPage")
);

const BlogsPage = lazy(
  () => import("./pages/BlogsPage")
);

const BlogDetail = lazy(
  () => import("./pages/BlogDetail")
);

const GardenCarePlans = lazy(
  () => import("./pages/GardenCarePlans")
);

const AboutUs = lazy(
  () => import("./pages/AboutUs")
);

const PrivacyPolicy = lazy(
  () => import("./pages/PrivacyPolicy")
);

const TermsOfService = lazy(
  () => import("./pages/TermsOfService")
);

const AdminLogin = lazy(
  () => import("./pages/admin/AdminLogin")
);

const AdminDashboard = lazy(
  () => import("./pages/admin/AdminDashboard")
);

const AdminServices = lazy(
  () => import("./pages/admin/AdminServices")
);

const AdminAllServices = lazy(
  () => import("./pages/admin/AdminAllServices")
);

const AdminOrders = lazy(
  () => import("./pages/admin/AdminOrders")
);

const AdminSubscriptions = lazy(
  () => import("./pages/admin/AdminSubscriptions")
);

const AdminUsers = lazy(
  () => import("./pages/admin/AdminUsers")
);

const MySubscriptionsPage = lazy(
  () =>
    import(
      "./features/subscriptions/pages/MySubscriptionsPage"
    )
);

const ProviderLogin = lazy(
  () => import("./pages/provider/ProviderLogin")
);

const ProviderDashboard = lazy(
  () => import("./pages/provider/ProviderDashboard")
);

/* ------------------------------- App Layout ------------------------------- */

const AppLayout = memo(() => {
  return (
    <div className="min-h-screen overflow-x-hidden font-sans">
      <Navbar />

      <main className="min-h-[60vh] pt-[7rem] md:pt-20 pb-20 md:pb-0">
        <Outlet />
      </main>

      <Suspense fallback={null}>
        <Footer />
        <LocationPickerModal />
      </Suspense>

      <BottomNav />
    </div>
  );
});

AppLayout.displayName = "AppLayout";

/* ---------------------------------- App ---------------------------------- */

function App() {
  const [authPending, setAuthPending] = useState(() =>
    isEmailSignInUrl()
  );

  /* ---------------- Email Link Authentication ---------------- */

  useEffect(() => {
    if (!authPending) return;

    completeEmailLinkSignIn().finally(() => {
      setAuthPending(false);
    });
  }, [authPending]);

  /* --------------------------- Initial Loader --------------------------- */

  if (authPending) {
    return <RouteLoader />;
  }

  return (
    <ErrorBoundary>
      <ScrollToTop />

      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* ---------------- Public Routes ---------------- */}

          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/blogs"
              element={<BlogsPage />}
            />

            <Route
              path="/blogs/:blogId"
              element={<BlogDetail />}
            />

            <Route
              path="/services"
              element={<ServicesPage />}
            />

            <Route
              path="/services/:slug"
              element={<ServiceDetail />}
            />

            <Route
              path="/category/:categorySlug"
              element={<CategoryServices />}
            />

            <Route
              path="/garden-care"
              element={<GardenCarePlans />}
            />

            <Route
              path="/about"
              element={<AboutUs />}
            />

            <Route
              path="/privacy"
              element={<PrivacyPolicy />}
            />

            <Route
              path="/terms"
              element={<TermsOfService />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* ---------------- Protected User Routes ---------------- */}

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

            <Route
              path="/subscriptions"
              element={
                <UserProtectedRoute>
                  <MySubscriptionsPage />
                </UserProtectedRoute>
              }
            />
          </Route>

          {/* ---------------- Admin Routes ---------------- */}

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <AdminOrders />
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

          <Route
            path="/admin/subscriptions"
            element={
              <ProtectedRoute>
                <AdminSubscriptions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* ---------------- Provider Routes ---------------- */}

          <Route
            path="/provider/login"
            element={<ProviderLogin />}
          />

          <Route
            path="/provider"
            element={
              <ProviderProtectedRoute>
                <ProviderDashboard />
              </ProviderProtectedRoute>
            }
          />

          {/* ---------------- 404 ---------------- */}

          <Route element={<AppLayout />}>
            <Route
              path="*"
              element={<NotFound />}
            />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

/* ------------------------------- Route Loader ------------------------------ */

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <LoaderSpinner />

        <div>
          <p className="text-sm font-semibold text-slate-900">
            Loading page
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            Preparing your experience...
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Spinner ------------------------------ */

function LoaderSpinner() {
  return (
    <div className="relative h-10 w-10">
      <div className="absolute inset-0 rounded-full border-2 border-slate-200" />

      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-slate-900" />
    </div>
  );
}
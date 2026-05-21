import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleProtectedRoute } from './routes/ProtectedRoute';

// Static Imports for initial/public pages (optimized for fast LCP and SEO)
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';

// Lazy Loaded Pages for performance optimization
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
import MenuItemCard from './components/MenuItemCard'; // pre-import components
const RestaurantDashboard = lazy(() => import('./pages/RestaurantDashboard'));
const Menu = lazy(() => import('./pages/Menu'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderTracker = lazy(() => import('./pages/OrderTracker'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Premium, glassmorphism fallback spinner screen
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#090A0F] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient luxury glows */}
      <div className="absolute top-[-100px] left-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-amber-500/10 to-rose-500/10 dark:from-amber-500/5 dark:to-rose-500/5 blur-[80px]"></div>
      <div className="absolute bottom-[-100px] right-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-rose-500/10 to-orange-500/10 dark:from-rose-500/5 dark:to-orange-500/5 blur-[80px]"></div>
      
      {/* Loader Container */}
      <div className="p-8 rounded-3xl bg-white/60 dark:bg-slate-900/40 border border-white/20 dark:border-slate-800/40 backdrop-blur-xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20 animate-spin [animation-duration:3s]">
            <svg className="w-8 h-8 text-white stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-2xl border-4 border-rose-500/20 animate-ping [animation-duration:1.5s]"></div>
        </div>

        <h3 className="text-lg font-black bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 bg-clip-text text-transparent mb-2">
          VelocitiBites
        </h3>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase animate-pulse">
          Loading gourmet experience...
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Customer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleProtectedRoute allowedRoles={['customer']} />}>
                <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                <Route path="/menu/:restaurantId" element={<Menu />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-tracker/:orderId" element={<OrderTracker />} />
              </Route>
            </Route>

            {/* Protected Restaurant Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleProtectedRoute allowedRoles={['restaurant']} />}>
                <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
              </Route>
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Route>

            {/* Shared Profile Route (For Customers, Restaurants & Admins) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleProtectedRoute allowedRoles={['customer', 'restaurant', 'admin']} />}>
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;


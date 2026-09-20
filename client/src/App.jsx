import { Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/navbar/Navbar.jsx";
import Sidebar from "./components/sidebar/Sidebar.jsx";
import ProtectedRoute from "./protectRoutes/protectedRoutes.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Channel from "./pages/Channel.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import EditChannel from "./pages/EditChannel.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ChangeEmail from "./pages/ChangeEmail.jsx";

import Settings from "./pages/Settings.jsx";
import VerifyEmailChange from "./pages/VerifyEmailChange.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import ManageSubscriptions from "./pages/ManageSubscriptions.jsx";

function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <>
      <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="flex">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <Routes>
        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email-change" element={<VerifyEmailChange />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected application routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/channel" element={<Channel />} />
            <Route path="/channel/edit" element={<EditChannel />} />
            <Route path="/settings" element={<Settings />} />

            <Route
              path="/settings/account/change-email"
              element={<ChangeEmail />}
            />
            <Route
              path="/settings/account/change-password"
              element={<ChangePassword />}
            />

            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/subscriptions/manage" element={<ManageSubscriptions />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;

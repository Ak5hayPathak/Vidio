import { Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";

import Navbar from "./layouts/components/navbar/Navbar.jsx";
import Sidebar from "./layouts/components/sidebar/Sidebar.jsx";
import ProtectedRoute from "./routes/protectedRoutes.jsx";

import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";
import Home from "./features/home/pages/Home.jsx";
import Channel from "./features/channel/pages/Channel.jsx";
import UserChannel from "./features/channel/pages/UserChannel.jsx";
import VerifyEmail from "./features/auth/pages/VerifyEmail.jsx";
import EditChannel from "./features/channel/pages/EditChannel.jsx";
import ForgotPassword from "./features/auth/pages/ForgotPassword.jsx";
import ResetPassword from "./features/auth/pages/ResetPassword.jsx";
import ChangeEmail from "./features/settings/pages/ChangeEmail.jsx";

import Settings from "./features/settings/pages/Settings.jsx";
import VerifyEmailChange from "./features/auth/pages/VerifyEmailChange.jsx";
import ChangePassword from "./features/settings/pages/ChangePassword.jsx";
import Subscriptions from "./features/subscriptions/pages/Subscriptions.jsx";
import ManageSubscriptions from "./features/subscriptions/pages/ManageSubscriptions.jsx";
import History from "./features/history/pages/History.jsx";
import Subscribers from "./features/subscriptions/pages/Subscribers.jsx";
import Watch from "./features/video/pages/Watch.jsx";

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
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Channels */}
            <Route path="/channel" element={<Channel />} />
            <Route path="/channel/:username" element={<UserChannel />} />
            <Route path="/channel/edit" element={<EditChannel />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />

            <Route
              path="/settings/account/change-email"
              element={<ChangeEmail />}
            />

            <Route
              path="/settings/account/change-password"
              element={<ChangePassword />}
            />

            {/* Subscriptions */}
            <Route path="/subscriptions" element={<Subscriptions />} />

            <Route
              path="/subscriptions/manage"
              element={<ManageSubscriptions />}
            />

            <Route path="/subscribers" element={<Subscribers />} />

            {/* History */}
            <Route path="/history" element={<History />} />

            {/* Video */}
            <Route path="/watch/:videoId" element={<Watch/>} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;

import { Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/home/Navbar.jsx";
import Sidebar from "./components/sidebar/Sidebar.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import WatchLater from "./pages/WatchLater.jsx";
import History from "./pages/History.jsx";
import Playlists from "./pages/Playlist.jsx";
import Collab from "./pages/Collab.jsx";
import LikedVideos from "./pages/LikedVideos.jsx";
import Channel from "./pages/Channel.jsx";
import YourVideos from "./pages/YourVideos.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";

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

        {/* Application routes */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/history" element={<History />} />
          <Route path="/watch-later" element={<WatchLater />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/collab" element={<Collab />} />
          <Route path="/liked-videos" element={<LikedVideos />} />
          <Route path="/channel" element={<Channel />} />
          <Route path="/your-videos" element={<YourVideos />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

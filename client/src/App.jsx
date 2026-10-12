import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout.jsx";
import ProtectedRoute from "./routes/protectedRoutes.jsx";

// Authentication
import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";
import VerifyEmail from "./features/auth/pages/VerifyEmail.jsx";
import VerifyEmailChange from "./features/auth/pages/VerifyEmailChange.jsx";
import ForgotPassword from "./features/auth/pages/ForgotPassword.jsx";
import ResetPassword from "./features/auth/pages/ResetPassword.jsx";

// Home
import Home from "./features/home/pages/Home.jsx";

// Channel
import Channel from "./features/channel/pages/Channel.jsx";
import UserChannel from "./features/channel/pages/UserChannel.jsx";
import EditChannel from "./features/channel/pages/EditChannel.jsx";

// Settings
import Settings from "./features/settings/pages/Settings.jsx";
import ChangeEmail from "./features/settings/pages/ChangeEmail.jsx";
import ChangePassword from "./features/settings/pages/ChangePassword.jsx";

// Subscriptions
import Subscriptions from "./features/subscriptions/pages/Subscriptions.jsx";
import ManageSubscriptions from "./features/subscriptions/pages/ManageSubscriptions.jsx";
import Subscribers from "./features/subscriptions/pages/Subscribers.jsx";

// History
import History from "./features/history/pages/History.jsx";

// Video
import Watch from "./features/video/pages/Watch.jsx";
import EditVideo from "./features/video/pages/EditVideo.jsx";
import UploadVideo from "./features/video/pages/UploadVideo.jsx";
import LikedVideos from "./features/video/pages/LikedVideos.jsx";
import WatchLater from "./features/video/pages/WatchLater.jsx";
import YourVideos from "./features/video/pages/YourVideos.jsx";

// Playlist
import Playlists from "./features/playlist/pages/Playlists.jsx";
import PlaylistDetails from "./features/playlist/pages/PlaylistDetails.jsx";

function App() {
  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <Routes>
        {/* Public authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email-change" element={<VerifyEmailChange />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected application routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Channel */}
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
            <Route path="/video/watch/:videoId" element={<Watch />} />
            <Route path="/video/edit/:videoId" element={<EditVideo />} />
            <Route path="/video/upload" element={<UploadVideo />} />

            {/* Liked videos */}
            <Route path="/liked-videos" element={<LikedVideos />} />

            {/* Watch Later */}
            <Route path="/watch-later" element={<WatchLater />} />

            {/* Your videos */}
            <Route path="/your-videos" element={<YourVideos />} />

            {/* Playlists */}
            <Route path="/playlists" element={<Playlists />} />
            <Route
              path="/playlists/:playlistId"
              element={<PlaylistDetails />}
            />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;

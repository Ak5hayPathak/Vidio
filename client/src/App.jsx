import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout.jsx";
import ProtectedRoute from "./routes/protectedRoutes.jsx";

// Authentication
const Login = lazy(() => import("./features/auth/pages/Login.jsx"));
const Register = lazy(() => import("./features/auth/pages/Register.jsx"));
const VerifyEmail = lazy(() => import("./features/auth/pages/VerifyEmail.jsx"));
const VerifyEmailChange = lazy(
  () => import("./features/auth/pages/VerifyEmailChange.jsx"),
);
const ForgotPassword = lazy(
  () => import("./features/auth/pages/ForgotPassword.jsx"),
);
const ResetPassword = lazy(
  () => import("./features/auth/pages/ResetPassword.jsx"),
);

// Home
const Home = lazy(() => import("./features/home/pages/Home.jsx"));

// Channel
const Channel = lazy(() => import("./features/channel/pages/Channel.jsx"));
const UserChannel = lazy(
  () => import("./features/channel/pages/UserChannel.jsx"),
);
const EditChannel = lazy(
  () => import("./features/channel/pages/EditChannel.jsx"),
);

// Settings
const Settings = lazy(() => import("./features/settings/pages/Settings.jsx"));
const ChangeEmail = lazy(
  () => import("./features/settings/pages/ChangeEmail.jsx"),
);
const ChangePassword = lazy(
  () => import("./features/settings/pages/ChangePassword.jsx"),
);

// Subscriptions
const Subscriptions = lazy(
  () => import("./features/subscriptions/pages/Subscriptions.jsx"),
);
const ManageSubscriptions = lazy(
  () => import("./features/subscriptions/pages/ManageSubscriptions.jsx"),
);
const Subscribers = lazy(
  () => import("./features/subscriptions/pages/Subscribers.jsx"),
);

// History
const History = lazy(() => import("./features/history/pages/History.jsx"));

// Video
const Watch = lazy(() => import("./features/video/pages/Watch.jsx"));
const EditVideo = lazy(() => import("./features/video/pages/EditVideo.jsx"));
const UploadVideo = lazy(
  () => import("./features/video/pages/UploadVideo.jsx"),
);
const LikedVideos = lazy(
  () => import("./features/video/pages/LikedVideos.jsx"),
);
const WatchLater = lazy(() => import("./features/video/pages/WatchLater.jsx"));
const YourVideos = lazy(() => import("./features/video/pages/YourVideos.jsx"));

// Playlist
const Playlists = lazy(() => import("./features/playlist/pages/Playlists.jsx"));
const PlaylistDetails = lazy(
  () => import("./features/playlist/pages/PlaylistDetails.jsx"),
);
const PlaylistInvitations = lazy(
  () => import("./features/playlist/pages/PlaylistInvitations.jsx"),
);

// Search
const SearchResults = lazy(
  () => import("./layouts/components/navbar/search/pages/SearchResult.jsx"),
);

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-white" />
        <p className="text-sm text-gray-400">Loading page...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <Suspense fallback={<PageLoader />}>
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

              {/* Search */}
              <Route path="/search" element={<SearchResults />} />

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
              <Route
                path="/playlist-invitations"
                element={<PlaylistInvitations />}
              />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;

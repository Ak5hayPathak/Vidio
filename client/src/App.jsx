import { Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/history" element={<History />} />
      <Route path="/watch-later" element={<WatchLater />} />
      <Route path="/playlists" element={<Playlists />} />
      <Route path="/collab" element={<Collab />} />
      <Route path="/liked-videos" element={<LikedVideos />} />
      <Route path="/channel" element={<Channel />} />
      <Route path="/your-videos" element={<YourVideos/>} /> 
    </Routes>
  );
}

export default App;
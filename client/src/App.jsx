import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import WatchLater from "./pages/WatchLater.jsx";
import History from "./pages/History.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/history" element={<History />} />
      <Route path="/watch-later" element={<WatchLater />} />
    </Routes>
  );
}

export default App;
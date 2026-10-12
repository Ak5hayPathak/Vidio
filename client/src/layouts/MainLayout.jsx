import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./components/navbar/Navbar.jsx";
import Sidebar from "./components/sidebar/Sidebar.jsx";

function MainLayout() {
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

export default MainLayout;

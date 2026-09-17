import { useState } from "react";
import SidebarNavLink from "./SidebarNavLink.jsx";
import MobileBackdrop from "./MobileBackdrop.jsx";
import MobileHeader from "./MobileHeader.jsx";
import SidebarLabel from "./SidebarLabel.jsx";
import SidebarCollapseButton from "./SidebarCollapseButton.jsx";
import { youLinks } from "./sidebarLinks.js";

function Sidebar({ mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const renderLinks = (links) =>
    links.map((link) => (
      <SidebarNavLink
        key={link.to}
        {...link}
        collapsed={collapsed}
        onClick={handleNavClick}
      />
    ));

  return (
    <>
      <MobileBackdrop mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          h-screen
          w-60
          border-r
          border-white/10
          bg-[#08090b]
          transition-transform
          duration-300

          lg:sticky
          lg:top-16
          lg:z-auto
          lg:h-[calc(100vh-4rem)]
          lg:shrink-0
          lg:translate-x-0
          lg:transition-all

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

          ${collapsed ? "lg:w-20" : "lg:w-60"}
        `}
      >
        <nav
          className="
            h-full
            overflow-y-auto
            p-4
            scrollbar-thin-custom
          "
        >
          <MobileHeader setMobileOpen={setMobileOpen} />

          <SidebarCollapseButton
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />

          <SidebarLabel collapsed={collapsed}>You</SidebarLabel>

          {renderLinks(youLinks)}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
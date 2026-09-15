import { useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar({ mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `
      flex
      items-center
      ${collapsed ? "justify-center" : "gap-4"}
      rounded-xl
      px-4
      py-3
      text-gray-300
      transition
      hover:bg-white/5
      ${isActive ? "bg-red-600/10 text-red-500" : ""}
    `;

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="
            fixed
            inset-0
            z-40
            bg-black/60
            lg:hidden
          "
        />
      )}

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
          {/* Mobile Close */}
          <div className="mb-4 flex justify-between lg:hidden">
            {/* Logo */}
            <NavLink to="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="flex h-7 w-9 items-center justify-center rounded-xl bg-[#CE2029]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.18-6.86a1 1 0 0 0 0-1.66L9.53 4.29A1 1 0 0 0 8 5.14Z" />
                </svg>
              </div>

              <span className="text-xl font-bold text-white">Vidio</span>
            </NavLink>

            <button
              onClick={() => setMobileOpen(false)}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-gray-400
                transition
                hover:bg-white/10
                hover:text-white
              "
              title="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Desktop Collapse Button */}
          <div
            className={`
              mb-4
              hidden
              lg:flex
              ${collapsed ? "justify-center" : "justify-end"}
            `}
          >
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-gray-400
                transition
                hover:bg-white/10
                hover:text-white
              "
              title={collapsed ? "Open sidebar" : "Collapse sidebar"}
            >
              {collapsed ? "→" : "←"}
            </button>
          </div>

          {/* You */}
          {!collapsed && (
            <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              You
            </p>
          )}

          {/* Home */}
          <NavLink
            to="/"
            end
            className={navLinkClass}
            title="Home"
            onClick={handleNavClick}
          >
            <span>⌂</span>
            {!collapsed && <span>Home</span>}
          </NavLink>

          {/* Your Channel */}
          <NavLink
            to="/channel"
            className={navLinkClass}
            title="Your Channel"
            onClick={handleNavClick}
          >
            <span>◉</span>
            {!collapsed && <span>Your Channel</span>}
          </NavLink>

          {/* Subscriptions */}
          <NavLink
            to="/subscriptions"
            className={navLinkClass}
            title="Subscriptions"
            onClick={handleNavClick}
          >
            <span>▣</span>
            {!collapsed && <span>Subscriptions</span>}
          </NavLink>

          {/* History */}
          <NavLink
            to="/history"
            className={navLinkClass}
            title="History"
            onClick={handleNavClick}
          >
            <span>◷</span>
            {!collapsed && <span>History</span>}
          </NavLink>

          {/* Divider */}
          <div className="my-3 border-t border-white/10" />

          {/* Videos */}
          {!collapsed && (
            <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Videos
            </p>
          )}

          {/* Liked Videos */}
          <NavLink
            to="/liked-videos"
            className={navLinkClass}
            title="Liked Videos"
            onClick={handleNavClick}
          >
            <span>♡</span>
            {!collapsed && <span>Liked Videos</span>}
          </NavLink>

          {/* Watch Later */}
          <NavLink
            to="/watch-later"
            className={navLinkClass}
            title="Watch Later"
            onClick={handleNavClick}
          >
            <span>♡</span>
            {!collapsed && <span>Watch Later</span>}
          </NavLink>

          {/* Your Videos */}
          <NavLink
            to="/your-videos"
            className={navLinkClass}
            title="Your Videos"
            onClick={handleNavClick}
          >
            <span>♡</span>
            {!collapsed && <span>Your Videos</span>}
          </NavLink>

          {/* Divider */}
          <div className="my-3 border-t border-white/10" />

          {/* Playlists */}
          {!collapsed && (
            <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Playlists
            </p>
          )}

          {/* Playlists */}
          <NavLink
            to="/playlists"
            className={navLinkClass}
            title="Playlists"
            onClick={handleNavClick}
          >
            <span>☷</span>
            {!collapsed && <span>Playlists</span>}
          </NavLink>

          {/* Collab */}
          <NavLink
            to="/collab"
            className={navLinkClass}
            title="Collab"
            onClick={handleNavClick}
          >
            <span>👥</span>
            {!collapsed && <span>Collab</span>}
          </NavLink>

          {/* Divider */}
          <div className="my-3 border-t border-white/10" />

          {/* Tweets */}
          {!collapsed && (
            <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Tweets
            </p>
          )}

          <NavLink
            to="/my-tweets"
            className={navLinkClass}
            title="my-tweets"
            onClick={handleNavClick}
          >
            <span>👥</span>
            {!collapsed && <span>My Tweets</span>}
          </NavLink>

          {/* Liked Tweets */}
          <NavLink
            to="/liked-tweets"
            className={navLinkClass}
            title="liked-tweets"
            onClick={handleNavClick}
          >
            <span>👥</span>
            {!collapsed && <span>Liked Tweets</span>}
          </NavLink>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;

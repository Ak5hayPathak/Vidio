import { useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
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

  return (
    <aside
      className={`
        sticky
        top-16
        hidden
        h-[calc(100vh-4rem)]
        shrink-0
        border-r
        border-white/10
        bg-[#08090b]
        transition-all
        duration-300
        lg:block
        ${collapsed ? "w-20" : "w-60"}
      `}
    >
      <nav className="p-4">
        {/* Collapse Button */}
        <div
          className={`
            mb-4
            flex
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
        <NavLink to="/" end className={navLinkClass} title="Home">
          <span>⌂</span>

          {!collapsed && <span>Home</span>}
        </NavLink>

        {/* Your Channel */}
        <NavLink to="/channel" className={navLinkClass} title="Your Channel">
          <span>◉</span>

          {!collapsed && <span>Your Channel</span>}
        </NavLink>

        {/* Subscriptions */}
        <NavLink
          to="/subscriptions"
          className={navLinkClass}
          title="Subscriptions"
        >
          <span>▣</span>

          {!collapsed && <span>Subscriptions</span>}
        </NavLink>

        {/* History */}
        <NavLink to="/history" className={navLinkClass} title="History">
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
        >
          <span>♡</span>

          {!collapsed && <span>Liked Videos</span>}
        </NavLink>

        {/* Watch Later */}
        <NavLink to="/watch-later" className={navLinkClass} title="Watch Later">
          <span>♡</span>

          {!collapsed && <span>Watch Later</span>}
        </NavLink>

        {/* Your Videos */}
        <NavLink to="/your-videos" className={navLinkClass} title="Your Videos">
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
        <NavLink to="/playlists" className={navLinkClass} title="Playlists">
          <span>☷</span>

          {!collapsed && <span>Playlists</span>}
        </NavLink>

        {/* Collab */}
        <NavLink to="/collab" className={navLinkClass} title="Collab">
          <span>👥</span>

          {!collapsed && <span>Collab</span>}
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;

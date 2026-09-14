import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside
      className="
    sticky
    top-16
    hidden
    h-[calc(100vh-4rem)]
    w-60
    shrink-0
    border-r
    border-white/10
    bg-[#08090b]
    lg:block
  "
    >
      <nav className="space-y-1 p-4">
        <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          You
        </p>

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `
      flex
      items-center
      gap-4
      rounded-xl
      px-4
      py-3
      text-gray-300
      font-semibold
      transition
      hover:bg-white/5
      ${isActive ? "bg-red-600/10 text-red-500" : ""}
    `
          }
        >
          <span>⌂</span>
          Home
        </NavLink>

        <NavLink
          to="/subscriptions"
          className={({ isActive }) =>
            `
      flex
      items-center
      gap-4
      rounded-xl
      px-4
      py-3
      text-gray-300
      transition
      hover:bg-white/5
      ${isActive ? "bg-red-600/10 text-red-500" : ""}
    `
          }
        >
          <span>▣</span>
          Subscriptions
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `
      flex
      items-center
      gap-4
      rounded-xl
      px-4
      py-3
      text-gray-300
      transition
      hover:bg-white/5
      ${isActive ? "bg-red-600/10 text-red-500" : ""}
    `
          }
        >
          <span>◷</span>
          History
        </NavLink>

        <NavLink
          to="/channel"
          className={({ isActive }) =>
            `
      flex
      items-center
      gap-4
      rounded-xl
      px-4
      py-3
      text-gray-300
      transition
      hover:bg-white/5
      ${isActive ? "bg-red-600/10 text-red-500" : ""}
    `
          }
        >
          <span>◉</span>
          Your Channel
        </NavLink>

        <div className="my-3 border-t border-white/10" />

        <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Videos
        </p>

        <NavLink
          to="/liked-videos"
          className={({ isActive }) =>
            `
      flex
      items-center
      gap-4
      rounded-xl
      px-4
      py-3
      text-gray-300
      transition
      hover:bg-white/5
      ${isActive ? "bg-red-600/10 text-red-500" : ""}
    `
          }
        >
          <span>♡</span>
          Liked Videos
        </NavLink>

        <NavLink
          to="/watch-later"
          className={({ isActive }) =>
            `
      flex
      items-center
      gap-4
      rounded-xl
      px-4
      py-3
      text-gray-300
      transition
      hover:bg-white/5
      ${isActive ? "bg-red-600/10 text-red-500" : ""}
    `
          }
        >
          <span>♡</span>
          Watch Later
        </NavLink>

        <div className="my-3 border-t border-white/10" />

        <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Playlists
        </p>

        <NavLink
          to="/playlists"
          className={({ isActive }) =>
            `
      flex
      items-center
      gap-4
      rounded-xl
      px-4
      py-3
      text-gray-300
      transition
      hover:bg-white/5
      ${isActive ? "bg-red-600/10 text-red-500" : ""}
    `
          }
        >
          <span>☷</span>
          Playlists
        </NavLink>

        <NavLink
          to="/collab"
          className={({ isActive }) =>
            `
      flex
      items-center
      gap-4
      rounded-xl
      px-4
      py-3
      text-gray-300
      transition
      hover:bg-white/5
      ${isActive ? "bg-red-600/10 text-red-500" : ""}
    `
          }
        >
          <span>👥</span>
          Collab
        </NavLink>

        {/* <div className="my-5 border-t border-gray-200" /> */}

        {/* <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Explore
        </p>

        <NavLink
          to="/trending"
          className="
            flex
            items-center
            gap-4
            rounded-xl
            px-4
            py-3
            text-gray-300
            transition
            hover:bg-white/5
          "
        >
          <span>↗</span>
          Trending
        </NavLink>

        <NavLink
          to="/music"
          className="
            flex
            items-center
            gap-4
            rounded-xl
            px-4
            py-3
            text-gray-300
            transition
            hover:bg-white/5
          "
        >
          <span>♫</span>
          Music
        </NavLink>

        <NavLink
          to="/gaming"
          className="
            flex
            items-center
            gap-4
            rounded-xl
            px-4
            py-3
            text-gray-300
            transition
            hover:bg-white/5
          "
        >
          <span>◈</span>
          Gaming
        </NavLink>

        <NavLink
          to="/programming"
          className="
            flex
            items-center
            gap-4
            rounded-xl
            px-4
            py-3
            text-gray-300
            transition
            hover:bg-white/5
          "
        >
          <span>&lt;/&gt;</span>
          Programming
        </NavLink> */}
      </nav>
    </aside>
  );
}

export default Sidebar;

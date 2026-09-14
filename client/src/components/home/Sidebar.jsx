import { Link } from "react-router-dom";

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
        <Link
          to="/"
          className="
    flex
    items-center
    gap-4
    rounded-xl
    bg-red-600/10
    px-4
    py-3
    text-gray-300
    font-semibold
    text-red-500
  "
        >
          <span>⌂</span>
          Home
        </Link>

        <Link
          to="/subscriptions"
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
          <span>▣</span>
          Subscriptions
        </Link>

        <Link
          to="/history"
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
          <span>◷</span>
          History
        </Link>

        <Link
          to="/watch-later"
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
          <span>♡</span>
          Watch Later
        </Link>

        <Link
          to="/playlists"
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
          <span>☷</span>
          Playlists
        </Link>

        <div className="my-5 border-t border-gray-200" />

        <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Explore
        </p>

        <Link
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
        </Link>

        <Link
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
        </Link>

        <Link
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
        </Link>

        <Link
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
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;

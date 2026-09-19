import { useEffect, useRef, useState } from "react";
import { User, Settings, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import LogoutConfirm from "../logout/LogoutConfirm.jsx";

function ProfileButton({ user }) {
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");

      setLogoutOpen(false);
      navigate("/login");
    } catch (error) {
      console.error(
        "Logout failed:",
        error.response?.data?.message || error.message,
      );
    }
  };

  return (
    <div ref={profileRef} className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          overflow-hidden
          rounded-full
          bg-gray-900
          transition
          ${open ? "ring-2 ring-white/20" : ""}
        `}
        title="Profile"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-white">
            {user?.username?.charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </button>

      {/* Profile Menu */}
      {open && (
        <div
          className="
            absolute
            right-0
            top-12
            z-50
            w-64
            overflow-hidden
            rounded-xl
            border
            border-white/10
            bg-[#08090b]
            shadow-2xl
          "
        >
          {/* User Info */}
          <div
            className="
              border-b
              border-white/10
              px-4
              py-4
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  bg-gray-900
                "
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-white">
                    {user?.username?.charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.fullName || user?.username || "User"}
                </p>

                <p className="truncate text-xs text-gray-500">
                  @{user?.username || "username"}
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="p-1.5">
            {/* Your Channel */}
            <NavLink
              to="/channel"
              onClick={() => setOpen(false)}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-lg
                px-3
                py-2.5
                text-sm
                text-gray-300
                transition
                hover:bg-white/5
                hover:text-white
              "
            >
              <User size={18} />
              <span>Your Channel</span>
            </NavLink>

            {/* Settings */}
            <NavLink
              to="/settings"
              onClick={() => setOpen(false)}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-lg
                px-3
                py-2.5
                text-sm
                text-gray-300
                transition
                hover:bg-white/5
                hover:text-white
              "
            >
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
          </div>

          {/* Logout */}
          <div className="border-t border-white/10 p-1.5">
            <button
              onClick={() => {
                setOpen(false);
                setLogoutOpen(true);
              }}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-lg
                px-3
                py-2.5
                text-sm
                text-gray-300
                transition
                hover:bg-white/5
                hover:text-white
              "
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {logoutOpen && (
        <LogoutConfirm
          onCancel={() => setLogoutOpen(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  );
}

export default ProfileButton;

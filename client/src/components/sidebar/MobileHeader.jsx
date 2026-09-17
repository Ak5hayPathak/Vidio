import { NavLink } from "react-router-dom";
import Logo from "../logo/Logo.jsx";
import { X } from "lucide-react";

function MobileHeader({ setMobileOpen }) {
  return (
    <div className="flex-col lg:hidden">
      <div className="mb-4 flex justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Logo />
        </NavLink>

        {/* Close Button */}
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
          <X size={20} />
        </button>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-white/10" />
    </div>
  );
}

export default MobileHeader;
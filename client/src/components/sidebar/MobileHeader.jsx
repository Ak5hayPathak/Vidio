import NavbarLogo from "../logo/NavbarLogo.jsx";
import { X } from "lucide-react";

function MobileHeader({ setMobileOpen }) {
  return (
    <div className="flex-col lg:hidden">
      <div className="mb-4 flex justify-between">
        <NavbarLogo />

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

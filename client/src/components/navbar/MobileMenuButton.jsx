import { Menu } from "lucide-react";

function MobileMenuButton({ onMenuClick }) {
  return (
    <button
      onClick={onMenuClick}
      className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-lg
        text-gray-300
        transition
        hover:bg-white/10
        hover:text-white
        lg:hidden
      "
      title="Open sidebar"
    >
      <Menu size={22} />
    </button>
  );
}

export default MobileMenuButton;
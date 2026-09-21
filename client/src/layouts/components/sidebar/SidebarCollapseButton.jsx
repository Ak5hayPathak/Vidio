import { ChevronLeft, ChevronRight } from "lucide-react";

function SidebarCollapseButton({ collapsed, setCollapsed }) {
  return (
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
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </div>
  );
}

export default SidebarCollapseButton;

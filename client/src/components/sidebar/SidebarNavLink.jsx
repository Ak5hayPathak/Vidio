import { NavLink } from "react-router-dom";

function SidebarNavLink({ to, icon, label, collapsed, onClick, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      title={label}
      className={({ isActive }) => `
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
      `}
    >
      <span>{icon}</span>

      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

export default SidebarNavLink;
import { NavLink } from "react-router-dom";

function SidebarNavLink({
  to,
  icon: Icon,
  label,
  collapsed,
  onClick,
  end = false,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      title={label}
      className={({ isActive }) => `
  mb-2
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
      <Icon size={19} className="shrink-0" />

      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

export default SidebarNavLink;

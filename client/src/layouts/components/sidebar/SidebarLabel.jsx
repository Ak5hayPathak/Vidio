function SidebarLabel({ children, collapsed }) {
  if (collapsed) return null;

  return (
    <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
      {children}
    </p>
  );
}

export default SidebarLabel;
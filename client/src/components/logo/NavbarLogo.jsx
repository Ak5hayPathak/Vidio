import { NavLink } from "react-router-dom";

function NavbarLogo() {
  return (
    <NavLink to="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-1">
        <div className="flex h-5 w-8 items-center justify-center rounded-2xl bg-[#CE2029]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.18-6.86a1 1 0 0 0 0-1.66L9.53 4.29A1 1 0 0 0 8 5.14Z" />
          </svg>
        </div>

        <span className="text-[1.15em] font-bold text-white">Vidio</span>
      </div>
    </NavLink>
  );
}

export default NavbarLogo;
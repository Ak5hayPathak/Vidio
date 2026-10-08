import { NavLink } from "react-router-dom";

/**
 * Compact version of the red disc logo for the navbar.
 */
function NavbarLogo() {
  return (
    <NavLink
      to="/"
      aria-label="Vidio home"
      className="flex shrink-0 items-center gap-1.5"
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        {/* Solid red disc */}
        <circle cx="16" cy="16" r="15" fill="#CE2029" />
        {/* White play triangle, nudged right so it looks optically centered */}
        <polygon
          points="13.2,10.8 13.2,21.2 21.6,16"
          fill="white"
          stroke="white"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>

      <span className="text-[1.2em] font-semibold leading-none tracking-tight text-white">
        vidio
      </span>
    </NavLink>
  );
}

export default NavbarLogo;
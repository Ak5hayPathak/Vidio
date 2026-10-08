import { NavLink } from "react-router-dom";

/**
 * Solid red disc with a white play triangle, followed by a lowercase wordmark.
 */
function AuthLogo() {
  return (
    <NavLink
      to="/"
      aria-label="Vidio home"
      className="flex shrink-0 items-center gap-2"
    >
      <svg
        width="34"
        height="34"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="sm:h-9 sm:w-9"
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

      <span className="text-[1.6em] font-semibold leading-none tracking-tight text-white">
        vidio
      </span>
    </NavLink>
  );
}

export default AuthLogo;
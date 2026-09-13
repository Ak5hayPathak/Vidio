const SocialLogin = () => {
  return (
    <>
      {/* Divider */}
      <div className="flex items-center gap-4 my-7">
        <div className="h-px flex-1 bg-white/[0.07]" />

        <span className="text-xs text-gray-600 uppercase tracking-wider">
          or
        </span>

        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      {/* Google */}
      <button
        type="button"
        className="
          w-full h-12
          rounded-xl
          border border-white/[0.08]
          bg-white/[0.02]
          hover:bg-white/[0.05]
          text-gray-300
          font-medium
          transition
          flex items-center justify-center gap-3
        "
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M21.35 12.27c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.21Z"
          />

          <path
            fill="#4285F4"
            d="M12 21.8c2.63 0 4.83-.87 6.44-2.36l-3.14-2.44c-.87.58-1.98.92-3.3.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.73 9.73 0 0 0 12 21.8Z"
          />

          <path
            fill="#FBBC05"
            d="M6.54 13.89A5.84 5.84 0 0 1 6.23 12c0-.66.11-1.3.31-1.89V7.59H3.3A9.8 9.8 0 0 0 2.2 12c0 1.58.38 3.07 1.1 4.41l3.24-2.52Z"
          />

          <path
            fill="#34A853"
            d="M12 6.08c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.17 14.63 2.2 12 2.2a9.73 9.73 0 0 0-8.7 5.39l3.24 2.52C7.31 7.8 9.46 6.08 12 6.08Z"
          />
        </svg>

        Continue with Google
      </button>
    </>
  );
};

export default SocialLogin;

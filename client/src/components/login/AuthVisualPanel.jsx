import { Link } from "react-router-dom";

const AuthVisualPanel = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111318] via-[#090a0c] to-black" />

      {/* Ambient glow */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[120px]" />
      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[120px]" />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
        {/* Logo */}
        <div>
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:bg-red-500 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.18-6.86a1 1 0 0 0 0-1.66L9.53 4.29A1 1 0 0 0 8 5.14Z" />
              </svg>
            </div>

            <span className="text-2xl font-bold tracking-tight">Vidio</span>
          </Link>
        </div>

        {/* Main message */}
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-sm text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Your world of video
          </div>

          <h1 className="text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.05]">
            Watch.
            <br />
            Discover.
            <br />
            <span className="text-gray-500">Share.</span>
          </h1>

          <p className="mt-7 text-gray-400 text-base xl:text-lg leading-relaxed max-w-md">
            Sign in to continue watching your favorite creators, discover
            something new, and keep your videos organized.
          </p>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-600">
          © {new Date().getFullYear()} Vidio. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AuthVisualPanel;

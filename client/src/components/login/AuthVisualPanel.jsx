import AuthLogo from "../logo/AuthLogo";

const AuthVisualPanel = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111318] via-[#090a0c] to-black" />
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
        <AuthLogo/>

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

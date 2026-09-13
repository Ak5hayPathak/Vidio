
import { useState } from "react";

// import SocialLogin from "./SocialLogin.jsx";
import AuthFooter from "../login/AuthFooter";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Connect your register API here
    console.log("Register submitted");
  };

  return (
    <div className="w-full max-w-md">
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">
          Create your account
        </h2>

        <p className="mt-2 text-gray-500">
          Join Vidio and start sharing your videos.
        </p>
      </div>

      {/* Register form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Full name
          </label>

          <input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            className="
              w-full h-12 px-4
              rounded-xl
              bg-[#111317]
              border border-white/[0.08]
              text-white
              placeholder:text-gray-600
              outline-none
              transition
              focus:border-red-500/60
              focus:ring-2
              focus:ring-red-500/10
            "
            required
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            className="
              w-full h-12 px-4
              rounded-xl
              bg-[#111317]
              border border-white/[0.08]
              text-white
              placeholder:text-gray-600
              outline-none
              transition
              focus:border-red-500/60
              focus:ring-2
              focus:ring-red-500/10
            "
            required
          />
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Username
          </label>

          <input
            id="username"
            type="text"
            placeholder="Choose a username"
            autoComplete="username"
            className="
              w-full h-12 px-4
              rounded-xl
              bg-[#111317]
              border border-white/[0.08]
              text-white
              placeholder:text-gray-600
              outline-none
              transition
              focus:border-red-500/60
              focus:ring-2
              focus:ring-red-500/10
            "
            required
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              autoComplete="new-password"
              className="
                w-full h-12 px-4 pr-12
                rounded-xl
                bg-[#111317]
                border border-white/[0.08]
                text-white
                placeholder:text-gray-600
                outline-none
                transition
                focus:border-red-500/60
                focus:ring-2
                focus:ring-red-500/10
              "
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="
                absolute right-4 top-1/2 -translate-y-1/2
                text-gray-500 hover:text-gray-300
                transition
              "
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                  <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.6 11.6 0 0 1-2.05 3.55" />
                  <path d="M6.61 6.61C4.62 7.88 3.05 9.76 2 12c1.73 4.89 6 8 10 8 1.57 0 3.07-.34 4.39-.96" />
                </svg>
              ) : (
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Confirm password
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              autoComplete="new-password"
              className="
                w-full h-12 px-4 pr-12
                rounded-xl
                bg-[#111317]
                border border-white/[0.08]
                text-white
                placeholder:text-gray-600
                outline-none
                transition
                focus:border-red-500/60
                focus:ring-2
                focus:ring-red-500/10
              "
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="
                absolute right-4 top-1/2 -translate-y-1/2
                text-gray-500 hover:text-gray-300
                transition
              "
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? (
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                  <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.6 11.6 0 0 1-2.05 3.55" />
                  <path d="M6.61 6.61C4.62 7.88 3.05 9.76 2 12c1.73 4.89 6 8 10 8 1.57 0 3.07-.34 4.39-.96" />
                </svg>
              ) : (
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Register button */}
        <button
          type="submit"
          className="
            w-full h-12
            rounded-xl
            bg-red-600
            hover:bg-red-500
            active:bg-red-700
            text-white
            font-medium
            transition
            shadow-lg shadow-red-600/10
          "
        >
          Create account
        </button>
      </form>

    </div>
  );
};

export default RegisterForm;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";

import AuthFooter from "./AuthFooter.jsx";
import { loginUser } from "../auth.service.js";

const LoginForm = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const identifier = formData.usernameOrEmail.trim();

    const isEmail = identifier.includes("@");

    const loginData = {
      [isEmail ? "email" : "username"]: identifier,
      password: formData.password,
      rememberMe,
    };

    try {
      const response = await loginUser(loginData);

      setUser(response.data.user);

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong while logging in.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>

        <p className="mt-2 text-gray-500">
          Sign in to your Vidio account to continue.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="
            mb-5
            rounded-xl
            border
            border-red-500/20
            bg-red-500/10
            px-4
            py-3
            text-sm
            leading-5
            text-red-400
          "
        >
          {error}
        </div>
      )}

      {/* Login form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username or Email */}
        <div>
          <label
            htmlFor="usernameOrEmail"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Username or email
          </label>

          <input
            id="usernameOrEmail"
            name="usernameOrEmail"
            type="text"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            placeholder="Enter your username or email"
            autoComplete="username"
            required
            className="
              h-12
              w-full
              rounded-xl
              border
              border-white/[0.08]
              bg-[#111317]
              px-4
              text-white
              placeholder:text-gray-600
              outline-none
              transition
              focus:border-red-500/60
              focus:ring-2
              focus:ring-red-500/10
            "
          />
        </div>

        {/* Password */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>

            <Link
              to="/forgot-password"
              className="
                text-sm
                text-gray-500
                transition
                hover:text-red-400
              "
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="
                h-12
                w-full
                rounded-xl
                border
                border-white/[0.08]
                bg-[#111317]
                px-4
                pr-12
                text-white
                placeholder:text-gray-600
                outline-none
                transition
                focus:border-red-500/60
                focus:ring-2
                focus:ring-red-500/10
              "
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-gray-500
                transition
                hover:text-gray-300
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

        {/* Remember me */}
        <div className="flex items-center">
          <label className="flex cursor-pointer select-none items-center gap-3">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-red-600"
            />

            <span className="text-sm text-gray-500">Remember me</span>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="
            h-12
            w-full
            rounded-xl
            bg-red-600
            font-medium
            text-white
            shadow-lg
            shadow-red-600/10
            transition
            hover:bg-red-500
            active:bg-red-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* <SocialLogin /> */}

      <AuthFooter />
    </div>
  );
};

export default LoginForm;

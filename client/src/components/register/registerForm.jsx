import { useState } from "react";
import api from "../../services/api.js";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    avatar: null,
    coverImage: null,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const data = new FormData();

    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("username", formData.username);
    data.append("password", formData.password);

    if (formData.avatar) {
      data.append("avatar", formData.avatar);
    }

    if (formData.coverImage) {
      data.append("coverImage", formData.coverImage);
    }

    try {
      setLoading(true);

      const response = await api.post("/users/register", data);

      console.log(response.data);
      setRegistered(true);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message||
          "Something went wrong while creating your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full h-10 px-3
    rounded-lg
    bg-[#111317]
    border border-white/[0.08]
    text-white text-sm
    placeholder:text-gray-600
    outline-none
    transition
    focus:border-red-500/60
    focus:ring-2
    focus:ring-red-500/10
  `;

  const labelClass = `
    block text-xs font-medium text-gray-300 mb-1
  `;

  return (
    <div className="w-full max-w-md">
      {/* Heading */}
      <div className="mb-5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Join Vidio and start sharing your videos.
        </p>
      </div>

      {registered ? (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-600/10 text-2xl">
            ✉
          </div>

          <h2 className="mt-5 text-2xl font-semibold">Check your email</h2>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            We've sent a verification link to{" "}
            <span className="text-white">{formData.email}</span>. Please check
            your inbox and click the link to verify your account.
          </p>
        </div>
      ) : (
        /* Register form */
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Full name <span className="text-red-500">*</span>
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              value={formData.fullName}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClass}>
              Email <span className="text-red-500">*</span>
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className={labelClass}>
              Username <span className="text-red-500">*</span>
            </label>

            <input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Avatar */}
          <div>
            <label htmlFor="avatar" className={labelClass}>
              Avatar{" "}
              <span className="text-gray-500 font-normal">(Optional)</span>
            </label>

            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="
              block w-full
              text-xs text-gray-400
              file:mr-3
              file:py-1.5
              file:px-3
              file:rounded-lg
              file:border-0
              file:bg-red-600
              file:text-white
              file:text-xs
              file:font-medium
              hover:file:bg-red-500
              cursor-pointer
            "
            />
          </div>

          {/* Cover Image */}
          <div>
            <label htmlFor="coverImage" className={labelClass}>
              Cover image{" "}
              <span className="text-gray-500 font-normal">(Optional)</span>
            </label>

            <input
              id="coverImage"
              name="coverImage"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="
              block w-full
              text-xs text-gray-400
              file:mr-3
              file:py-1.5
              file:px-3
              file:rounded-lg
              file:border-0
              file:bg-red-600
              file:text-white
              file:text-xs
              file:font-medium
              hover:file:bg-red-500
              cursor-pointer
            "
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className={labelClass}>
              Password <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`${inputClass} pr-11`}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                absolute right-3 top-1/2 -translate-y-1/2
                text-gray-500 hover:text-gray-300
                transition
              "
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
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
                    width="18"
                    height="18"
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
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm password <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${inputClass} pr-11`}
                required
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="
                absolute right-3 top-1/2 -translate-y-1/2
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
                    width="18"
                    height="18"
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
                    width="18"
                    height="18"
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

          {/* Error */}
          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Register button */}
          <button
            type="submit"
            disabled={loading}
            className="
            w-full h-10
            rounded-lg
            bg-red-600
            hover:bg-red-500
            active:bg-red-700
            disabled:opacity-50
            disabled:cursor-not-allowed
            text-sm
            text-white
            font-medium
            transition
            shadow-lg shadow-red-600/10
          "
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      )}
    </div>
  );
};

export default RegisterForm;

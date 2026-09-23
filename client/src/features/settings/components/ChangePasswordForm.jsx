import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="
          mb-2
          block
          text-sm
          font-medium
          text-gray-200
        "
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className="
            h-11
            w-full
            rounded-xl
            border
            border-white/10
            bg-[#08090b]
            px-4
            pr-12
            text-sm
            text-white
            outline-none
            placeholder:text-gray-500
            transition
            focus:border-red-600
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        />

        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          disabled={disabled}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-gray-500
            transition
            hover:text-white
            disabled:cursor-not-allowed
          "
          aria-label={
            showPassword
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;

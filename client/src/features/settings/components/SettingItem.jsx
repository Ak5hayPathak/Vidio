import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const SettingItem = ({
  icon: Icon,
  title,
  description,
  action,
  showArrow = false,
  border = true,
  disabled = false,
  to,
  onClick,
}) => {
  const className = `
    flex
    w-full
    items-center
    gap-4
    p-5
    text-left
    transition
    ${border ? "border-b border-white/10" : ""}
    ${
      disabled
        ? "cursor-not-allowed opacity-50"
        : "hover:bg-white/5"
    }
  `;

  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600/10 text-red-500">
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      {action}

      {showArrow && (
        <ChevronRight
          size={20}
          className="shrink-0 text-gray-500"
        />
      )}
    </>
  );

  // Navigation
  if (to && !disabled) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  // Clickable setting without nested button problems
  if (onClick && !disabled && !action) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
      >
        {content}
      </button>
    );
  }

  // Normal / disabled setting
  return (
    <div
      className={className}
      aria-disabled={disabled}
    >
      {content}
    </div>
  );
};

export default SettingItem;
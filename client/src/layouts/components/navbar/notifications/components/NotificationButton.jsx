import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import NotificationPanel from "./NotificationPanel.jsx";
import useNotifications from "../../notifications/hooks/useNotifications.js";

function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const notificationState = useNotifications();
  const { unreadCount } = notificationState;

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="
          relative flex h-9 w-9 shrink-0 items-center justify-center
          rounded-full text-gray-300 transition
          hover:bg-white/10 hover:text-white
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-white/40
        "
      >
        <Bell size={20} strokeWidth={1.8} />

        {unreadCount > 0 && (
          <span
            className="
              absolute -right-0.5 -top-0.5 flex h-4 min-w-4
              items-center justify-center rounded-full
              bg-[#CE2029] px-1 text-[10px] font-semibold text-white
            "
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel
          onClose={() => setIsOpen(false)}
          notificationState={notificationState}
        />
      )}
    </div>
  );
}

export default NotificationButton;

import { Bell } from "lucide-react";

function NotificationButton({ notificationCount = 0 }) {
  return (
    <button
      className="
        relative
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-full
        text-gray-300
        transition
        hover:bg-white/10
        hover:text-white
      "
      title="Notifications"
    >
      <Bell size={20} strokeWidth={1.8} />

      {notificationCount > 0 && (
        <div
          className="
            absolute
            -right-0.5
            -top-0.5
            flex
            h-4
            min-w-4
            items-center
            justify-center
            rounded-full
            bg-[#CE2029]
            px-1
            text-[10px]
            font-semibold
            text-white
          "
        >
          {notificationCount}
        </div>
      )}
    </button>
  );
}

export default NotificationButton;
import {
  Bell,
  Heart,
  MessageCircle,
  UserRoundPlus,
  Video,
  ListVideo,
  Reply,
} from "lucide-react";

const notificationIcons = {
  playlist_invitation: ListVideo,
  playlist_invitation_accepted: ListVideo,
  new_subscriber: UserRoundPlus,
  video_comment: MessageCircle,
  comment_reply: Reply,
  video_like: Heart,
  comment_like: Heart,
  tweet_like: Heart,
  new_tweet: MessageCircle,
  new_video: Video,
};

function getRelativeTime(date) {
  if (!date) return "";

  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function NotificationItem({ notification, onClick }) {
  const Icon = notificationIcons[notification.type] || Bell;
  const sender = notification.sender;

  const handleClick = () => {
    onClick?.(notification);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        group flex w-full items-start gap-3 px-5 py-4 text-left
        transition-colors hover:bg-white/[0.045]
        ${notification.isRead ? "" : "bg-[#CE2029]/[0.045]"}
      `}
    >
      <div className="relative h-11 w-11 shrink-0">
        {sender?.avatar ? (
          <img
            src={sender.avatar}
            alt={sender.username || "User"}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white/[0.07] text-gray-300">
            <UserRoundPlus size={19} />
          </div>
        )}

        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#111214] bg-[#CE2029] text-white">
          <Icon size={12} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-5 text-gray-200">
          {sender?.fullName || sender?.username || "Vidio user"}

          {sender?.username && sender?.fullName && (
            <span className="text-gray-500"> @{sender.username}</span>
          )}
        </p>

        <p className="mt-1 break-words text-sm leading-5 text-gray-400">
          {notification.message}
        </p>

        <p className="mt-2 text-xs text-gray-500">
          {getRelativeTime(notification.createdAt)}
        </p>
      </div>

      {!notification.isRead && (
        <span
          className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#CE2029]"
          aria-label="Unread"
        />
      )}
    </button>
  );
}

export default NotificationItem;

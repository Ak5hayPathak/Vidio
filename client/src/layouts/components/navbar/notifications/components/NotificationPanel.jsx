import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, LoaderCircle, RefreshCw, X } from "lucide-react";

import { getNotificationPath } from "../notificationNavigation.js";
import NotificationItem from "./NotificationItem.jsx";

function NotificationPanel({
  onClose,
  onNotificationClick,
  notificationState,
}) {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    filter,
    setFilter,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = notificationState;

  const [actionError, setActionError] = useState("");

  const handleMarkAllAsRead = async () => {
    setActionError("");

    try {
      await markAllAsRead();
    } catch {
      setActionError("Couldn't mark all notifications as read.");
    }
  };

  const handleNotificationClick = async (notification) => {
    setActionError("");

    console.log("Clicked notification:", notification);
    console.log("Notification videoId:", notification.videoId);
    console.log("Notification resource:", notification.resource);

    try {
      if (!notification.isRead) {
        await markAsRead(notification._id);
      }

      onNotificationClick?.(notification);

      const path = getNotificationPath(notification);

      console.log("Generated navigation path:", path);

      if (path) {
        onClose();
        navigate(path);
      } else {
        setActionError(
          "Unable to open this notification. The destination ID may be missing.",
        );
      }
    } catch (error) {
      console.error("Notification click failed:", error);

      setActionError("Couldn't open this notification. Please try again.");
    }
  };

  const handleRefresh = async () => {
    setActionError("");

    try {
      await refreshNotifications();
    } catch {
      setActionError("Couldn't refresh notifications. Please try again.");
    }
  };

  const isEmpty = !loading && notifications.length === 0;

  return (
    <section
      role="dialog"
      aria-label="Notifications"
      className="
        absolute right-0 top-12 z-[100]
        flex max-h-[min(80vh,680px)]
        w-[min(480px,calc(100vw-24px))]
        flex-col overflow-hidden rounded-2xl
        border border-white/[0.08]
        bg-[#111214]
        shadow-[0_24px_80px_rgba(0,0,0,0.65)]
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#CE2029]/10">
              <Bell size={19} className="text-[#CE2029]" />
            </div>

            <h2 className="text-lg font-bold tracking-tight text-white">
              Notifications
            </h2>

            {unreadCount > 0 && (
              <span className="rounded-full bg-[#CE2029]/15 px-2 py-0.5 text-xs font-semibold text-[#ff777d]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            aria-label="Refresh notifications"
            title="Refresh"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Filters and actions */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filter === "all"
                ? "bg-[#CE2029] text-white shadow-[0_2px_12px_rgba(206,32,41,0.18)]"
                : "border border-white/[0.08] bg-white/[0.03] text-gray-400 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            aria-pressed={filter === "unread"}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
              filter === "unread"
                ? "bg-[#CE2029] text-white shadow-[0_2px_12px_rgba(206,32,41,0.18)]"
                : "border border-white/[0.08] bg-white/[0.03] text-gray-400 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  filter === "unread" ? "bg-white" : "bg-[#CE2029]"
                }`}
              />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          title="Mark all as read"
          aria-label="Mark all notifications as read"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-[#CE2029]/10 hover:text-[#CE2029] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <CheckCheck size={18} />
        </button>
      </div>

      {/* Notification list */}
      <div className="min-h-64 flex-1 overflow-y-auto">
        {(error || actionError) && (
          <div
            role="alert"
            className="mx-4 mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300"
          >
            {actionError || error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-gray-500">
            <LoaderCircle size={25} className="animate-spin text-[#CE2029]" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : isEmpty ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-8 py-12 text-center">
            <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-2xl border border-[#CE2029]/20 bg-gradient-to-br from-[#CE2029]/15 to-[#CE2029]/[0.02]">
              <Bell size={31} className="text-[#CE2029]" strokeWidth={1.5} />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#111214] bg-[#CE2029]" />
            </div>

            <h3 className="mt-6 text-base font-semibold text-gray-100">
              {filter === "unread"
                ? "You're all caught up"
                : "No notifications yet"}
            </h3>

            <p className="mt-2 max-w-[290px] text-sm leading-6 text-gray-500">
              {filter === "unread"
                ? "You've read all your notifications. New updates will appear here."
                : "When someone interacts with your videos, subscribes to your channel, or invites you to collaborate on a playlist, you'll find their updates here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.045]">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}

        {!loading && hasMore && (
          <div className="px-5 py-4">
            <button
              type="button"
              onClick={() =>
                loadMore().catch(() => {
                  setActionError("Couldn't load more notifications.");
                })
              }
              disabled={loadingMore}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
            >
              {loadingMore && (
                <LoaderCircle size={16} className="animate-spin" />
              )}

              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.08] bg-[#0D0E10] px-5 py-3">
        <p className="text-center text-xs text-gray-600">
          You're viewing your latest Vidio activity
        </p>
      </div>
    </section>
  );
}

export default NotificationPanel;

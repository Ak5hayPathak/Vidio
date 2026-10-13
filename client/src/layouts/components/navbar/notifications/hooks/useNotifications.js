import { useCallback, useEffect, useState } from "react";

import {
  getNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead as markNotificationAsReadApi,
  markAllNotificationsAsRead as markAllNotificationsAsReadApi,
} from "../notification.service.js";

const PAGE_SIZE = 10;

function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Fetch the unread count independently of the selected filter.
  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
      return count;
    } catch (err) {
      console.error("Failed to fetch unread notification count:", err);
      throw err;
    }
  }, []);

  // Fetch notifications for the selected filter and page.
  const fetchPage = useCallback(
    async (pageNumber = 1, { append = false } = {}) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const fetcher =
          filter === "unread" ? getUnreadNotifications : getNotifications;

        const result = await fetcher({
          page: pageNumber,
          limit: PAGE_SIZE,
        });

        const docs = result?.docs ?? [];

        setNotifications((current) => (append ? [...current, ...docs] : docs));

        setPage(pageNumber);
        setHasMore(Boolean(result?.hasNextPage));

        return result;
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError(
          err.response?.data?.message ||
            "Couldn't load notifications. Please try again.",
        );
        throw err;
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter],
  );

  // Load notifications whenever the filter changes.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotifications([]);
      setPage(1);
      setHasMore(false);

      try {
        const fetcher =
          filter === "unread" ? getUnreadNotifications : getNotifications;

        const [result] = await Promise.all([
          fetcher({ page: 1, limit: PAGE_SIZE }),
          refreshUnreadCount(),
        ]);

        if (cancelled) return;

        setNotifications(result?.docs ?? []);
        setPage(1);
        setHasMore(Boolean(result?.hasNextPage));
        setError(null);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to initialize notifications:", err);
        setError(
          err.response?.data?.message ||
            "Couldn't load notifications. Please try again.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [filter, refreshUnreadCount]);

  // Load the next page when the user requests more.
  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    await fetchPage(page + 1, { append: true });
  }, [fetchPage, hasMore, loading, loadingMore, page]);

  // Reload the first page and refresh the unread count.
  const refreshNotifications = useCallback(async () => {
    const results = await Promise.allSettled([
      fetchPage(1),
      refreshUnreadCount(),
    ]);

    const failedRequest = results.find(
      (result) => result.status === "rejected",
    );

    if (failedRequest) {
      throw failedRequest.reason;
    }
  }, [fetchPage, refreshUnreadCount]);

  // Optimistically mark one notification as read.
  const markAsRead = useCallback(
    async (notificationId) => {
      const target = notifications.find(
        (notification) => notification._id === notificationId,
      );

      if (!target || target.isRead) return;

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );

      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        await markNotificationAsReadApi(notificationId);

        // Remove it from the current list if viewing unread only.
        if (filter === "unread") {
          setNotifications((current) =>
            current.filter(
              (notification) => notification._id !== notificationId,
            ),
          );
        }
      } catch (err) {
        // Restore the original state if the request fails.
        setNotifications((current) =>
          current.map((notification) =>
            notification._id === notificationId
              ? { ...notification, isRead: false }
              : notification,
          ),
        );

        setUnreadCount((count) => count + 1);
        setError(
          err.response?.data?.message ||
            "Couldn't mark the notification as read.",
        );

        throw err;
      }
    },
    [filter, notifications],
  );

  // Optimistically mark every notification as read.
  const markAllAsRead = useCallback(async () => {
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );

    setUnreadCount(0);
    setError(null);

    try {
      await markAllNotificationsAsReadApi();

      if (filter === "unread") {
        setNotifications([]);
        setHasMore(false);
      }
    } catch (err) {
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);

      setError(
        err.response?.data?.message ||
          "Couldn't mark all notifications as read.",
      );

      throw err;
    }
  }, [filter, notifications, unreadCount]);

  return {
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
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
  };
}

export default useNotifications;

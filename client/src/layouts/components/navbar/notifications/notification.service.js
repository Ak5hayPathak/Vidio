import api from "../../../../services/api.js";

const NOTIFICATION_URL = "/notifications";

const getNotifications = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get(`${NOTIFICATION_URL}/`, {
    params: { page, limit },
  });

  return response.data.data;
};

const getUnreadNotifications = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get(`${NOTIFICATION_URL}/unread`, {
    params: { page, limit },
  });

  return response.data.data;
};

const getUnreadNotificationCount = async () => {
  const response = await api.get(`${NOTIFICATION_URL}/unread-count`);

  return response.data.data.unreadCount;
};

const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(
    `${NOTIFICATION_URL}/${notificationId}/read`,
  );

  return response.data.data;
};

const markAllNotificationsAsRead = async () => {
  const response = await api.patch(`${NOTIFICATION_URL}/read-all`);

  return response.data.data;
};

export {
  getNotifications,
  getUnreadNotificationCount,
  getUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
};

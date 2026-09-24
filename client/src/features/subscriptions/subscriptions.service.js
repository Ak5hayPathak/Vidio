import api from "../../services/api.js";

async function getUserSubscriptions(userId, signal) {
  const response = await api.get(`/subscriptions/u/${userId}`, { signal });

  return response.data.data.docs || [];
}

async function unsubscribeFromChannel(channelId) {
  const response = await api.post(`/subscriptions/c/${channelId}`);

  return response.data;
}

async function toggleSubscription(channelId) {
  const response = await api.post(`/subscriptions/c/${channelId}`);

  return response.data;
}

async function getSubscribers(userId, signal) {
  const response = await api.get(`/subscriptions/s/${userId}`, { signal });

  const data = response.data?.data;

  const subscriberList = data?.docs || data || [];

  return Array.isArray(subscriberList) ? subscriberList : [];
}

const getSubscriptionStatus = async (channelId) => {
  const response = await api.get(`/subscriptions/status/${channelId}`);

  return response.data;
};

export {
  getUserSubscriptions,
  unsubscribeFromChannel,
  getSubscribers,
  getSubscriptionStatus,
  toggleSubscription,
};

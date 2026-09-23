import api from "../../services/api.js";

async function changeEmail(currentEmail, newEmail) {
  const response = await api.post("/users/change-email", {
    currentEmail,
    newEmail,
  });

  return response.data;
}

async function changePassword(currentPassword, newPassword) {
  const response = await api.post("/users/change-password", {
    currentPassword,
    newPassword,
  });

  return response.data;
}

async function logoutUser() {
  const response = await api.post("/users/logout");

  return response.data;
}

export { changeEmail, changePassword, logoutUser };

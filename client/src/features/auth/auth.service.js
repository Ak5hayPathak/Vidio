import api from "../../services/api.js";

async function forgotPassword(email) {
  const response = await api.post("/users/forgot-password", {
    email: email.trim(),
  });

  return response.data;
}

async function loginUser(loginData) {
  const response = await api.post("/users/login", loginData);

  return response.data;
}

async function registerUser(data) {
  const response = await api.post("/users/register", data);

  return response.data;
}

async function resetPassword(token, newPassword, confirmPassword) {
  const response = await api.post(`/users/reset-password/${token}`, {
    newPassword,
    confirmPassword,
  });

  return response.data;
}

async function verifyEmail(token) {
  const response = await api.get(`/users/verify-email/${token}`);

  return response.data;
}

async function resendVerificationEmail(email) {
  const response = await api.post("/users/resend-verification-email", {
    email: email.trim(),
  });

  return response.data;
}

async function verifyChangedEmail(token) {
  const response = await api.post(
    `/users/verify-changed-email/${token}`,
  );

  return response.data;
}

export {
  loginUser,
  registerUser,
  resetPassword,
  forgotPassword,
  verifyEmail,
  resendVerificationEmail,
  verifyChangedEmail,
};

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function validateEmailChange(currentEmail, newEmail) {
  if (!currentEmail || !newEmail) {
    return "Please enter both email addresses";
  }

  if (currentEmail === newEmail) {
    return "New email must be different from your current email";
  }

  return "";
}

function validatePasswordChange(currentPassword, newPassword, confirmPassword) {
  if (!currentPassword || !newPassword || !confirmPassword) {
    return "Please fill in all fields.";
  }

  if (newPassword !== confirmPassword) {
    return "New password and confirm password do not match.";
  }

  if (currentPassword === newPassword) {
    return "New password must be different from your current password.";
  }

  return "";
}

export { normalizeEmail, validateEmailChange, validatePasswordChange };

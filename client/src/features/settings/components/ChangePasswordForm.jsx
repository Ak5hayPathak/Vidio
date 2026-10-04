import PasswordInput from "./PasswordForm.jsx";

function ChangePasswordForm({
  currentPassword,
  newPassword,
  confirmPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  loading,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <PasswordInput
        id="currentPassword"
        label="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Enter current password"
        autoComplete="current-password"
        disabled={loading}
      />

      <PasswordInput
        id="newPassword"
        label="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
        autoComplete="new-password"
        disabled={loading}
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm your new password"
        autoComplete="new-password"
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading}
        className="
          w-full
          rounded-xl
          bg-red-600
          px-4
          py-3
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-red-700
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {loading ? "Updating Password..." : "Change Password"}
      </button>
    </form>
  );
}

export default ChangePasswordForm;

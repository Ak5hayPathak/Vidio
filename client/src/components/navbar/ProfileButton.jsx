function ProfileButton({ user }) {
  return (
    <button
      className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-full
        bg-gray-900
      "
      title="Profile"
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.username}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-sm font-semibold text-white">
          {user?.username?.charAt(0).toUpperCase() || "?"}
        </span>
      )}
    </button>
  );
}

export default ProfileButton;
function LogoutConfirm({ onConfirm, onCancel }) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/60
        px-4
      "
    >
      <div
        className="
          w-full
          max-w-sm
          rounded-xl
          border
          border-white/10
          bg-[#08090b]
          p-5
          shadow-2xl
        "
      >
        <h2 className="text-lg font-semibold text-white">Logout?</h2>

        <p className="mt-2 text-sm text-gray-400">
          Are you sure you want to logout?
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="
              rounded-lg
              px-4
              py-2
              text-sm
              text-gray-300
              transition
              hover:bg-white/5
              hover:text-white
            "
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="
              rounded-lg
              bg-red-600
              px-4
              py-2
              text-sm
              font-medium
              text-white
              transition
              hover:bg-red-700
            "
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirm;

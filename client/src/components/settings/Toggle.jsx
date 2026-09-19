const Toggle = ({ enabled, onChange }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`
        relative
        h-6
        w-11
        shrink-0
        rounded-full
        transition
        ${enabled ? "bg-red-600" : "bg-gray-700"}
      `}
    >
      <span
        className={`
          absolute
          top-1
          h-4
          w-4
          rounded-full
          bg-white
          transition
          ${enabled ? "left-6" : "left-1"}
        `}
      />
    </button>
  );
};

export default Toggle;
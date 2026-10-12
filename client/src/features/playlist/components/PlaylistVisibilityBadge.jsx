import { Globe, LockKeyhole } from "lucide-react";

function PlaylistVisibilityBadge({ isPublic = true, className = "" }) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-medium
        ${
          isPublic
            ? "border-green-500/20 bg-green-500/10 text-green-400"
            : "border-gray-500/20 bg-gray-500/10 text-gray-400"
        }
        ${className}
      `}
    >
      {isPublic ? <Globe size={13} /> : <LockKeyhole size={13} />}

      {isPublic ? "Public" : "Private"}
    </span>
  );
}

export default PlaylistVisibilityBadge;

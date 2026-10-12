import { Globe, LockKeyhole, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

function PlaylistActionsMenu({
  isPublic,
  visibilityLoading,
  onEdit,
  onDelete,
  onToggleVisibility,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleEdit = () => {
    closeMenu();
    onEdit();
  };

  const handleDelete = () => {
    closeMenu();
    onDelete();
  };

  const handleVisibility = () => {
    closeMenu();
    onToggleVisibility();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((previous) => !previous)}
        aria-label="Playlist options"
        aria-expanded={menuOpen}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-300 transition hover:bg-white/5 hover:text-white"
      >
        <MoreVertical size={19} />
      </button>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close playlist options"
            className="fixed inset-0 z-20 cursor-default"
            onClick={closeMenu}
          />

          <div className="absolute left-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#151619] py-1 shadow-2xl">
            <button
              type="button"
              onClick={handleEdit}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              <Pencil size={16} />
              Edit playlist
            </button>

            <button
              type="button"
              disabled={visibilityLoading}
              onClick={handleVisibility}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              {isPublic ? <LockKeyhole size={16} /> : <Globe size={16} />}

              {visibilityLoading
                ? "Updating visibility..."
                : isPublic
                  ? "Make playlist private"
                  : "Make playlist public"}
            </button>

            <div className="my-1 border-t border-white/10" />

            <button
              type="button"
              onClick={handleDelete}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
            >
              <Trash2 size={16} />
              Delete playlist
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PlaylistActionsMenu;

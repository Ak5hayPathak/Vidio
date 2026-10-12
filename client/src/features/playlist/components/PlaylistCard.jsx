import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  EllipsisVertical,
  ImageOff,
  ListVideo,
  Play,
  Pencil,
  Trash2,
} from "lucide-react";

import PlaylistVisibilityBadge from "./PlaylistVisibilityBadge";

function PlaylistCard({ playlist, onEditClick, onDeleteClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  if (!playlist) return null;

  const playlistId = playlist._id || playlist.id;
  const videos = playlist.videosDetails || playlist.videos || [];

  const totalVideos =
    playlist.totalVideos ?? playlist.videos?.length ?? videos.length;

  const firstVideo = videos[0];

  const thumbnail =
    playlist.thumbnail ||
    (firstVideo && typeof firstVideo === "object"
      ? firstVideo.thumbnail
      : null);

  const isPublic = playlist.isPublic ?? true;
  const description = playlist.description?.trim();

  const updateMenuPosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 100;
    const menuWidth = 192;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < menuHeight + 12;

    setMenuPosition({
      top: openAbove ? rect.top - 8 : rect.bottom + 8,
      left: Math.max(
        8,
        Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
      ),
      openAbove,
    });
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    updateMenuPosition();

    function handlePointerDown(event) {
      if (
        menuRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsMenuOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    function handleScroll() {
      updateMenuPosition();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleScroll);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isMenuOpen]);

  const handleEdit = () => {
    setIsMenuOpen(false);
    onEditClick?.(playlist);
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    onDeleteClick?.(playlist);
  };

  return (
    <article className="group min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#111214] transition-colors hover:border-white/20">
      {/* Playlist thumbnail */}
      <Link
        to={playlistId ? `/playlists/${playlistId}` : "#"}
        className="relative block aspect-video overflow-hidden bg-[#1b1c20]"
        aria-label={`Open playlist ${playlist.name}`}
        onClick={(event) => {
          if (!playlistId) event.preventDefault();
        }}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={playlist.name || "Playlist thumbnail"}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            <ImageOff size={32} strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <ListVideo size={14} />
          <span>
            {totalVideos} {totalVideos === 1 ? "video" : "videos"}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
            <Play size={20} fill="currentColor" />
          </div>
        </div>
      </Link>

      {/* Playlist information */}
      <div className="flex items-start gap-3 p-3">
        <Link
          to={playlistId ? `/playlists/${playlistId}` : "#"}
          className="min-w-0 flex-1"
          onClick={(event) => {
            if (!playlistId) event.preventDefault();
          }}
        >
          <h3
            className="line-clamp-2 text-sm font-semibold leading-5 text-white transition-colors group-hover:text-red-500"
            title={playlist.name}
          >
            {playlist.name || "Untitled playlist"}
          </h3>

          {description && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">
              {description}
            </p>
          )}

          <div className="mt-2">
            <PlaylistVisibilityBadge isPublic={isPublic} />
          </div>
        </Link>

        {/* Three-dot menu trigger */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            if (isMenuOpen) {
              setIsMenuOpen(false);
            } else {
              updateMenuPosition();
              setIsMenuOpen(true);
            }
          }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
            isMenuOpen
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
          aria-label={`Actions for ${playlist.name || "playlist"}`}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          title="Playlist options"
        >
          <EllipsisVertical size={19} />
        </button>
      </div>

      {/* Portal renders the menu outside the card's overflow-hidden container */}
      {isMenuOpen &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[200] w-48 overflow-hidden rounded-xl border border-white/10 bg-[#1b1c20] py-1 shadow-xl shadow-black/50"
            style={{
              top: menuPosition.openAbove ? undefined : menuPosition.top,
              bottom: menuPosition.openAbove
                ? window.innerHeight - menuPosition.top
                : undefined,
              left: menuPosition.left,
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleEdit}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-200 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Pencil size={16} className="text-gray-400" />
              Update playlist
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleDelete}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 size={16} />
              Delete playlist
            </button>
          </div>,
          document.body,
        )}
    </article>
  );
}

export default PlaylistCard;

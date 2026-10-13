import { Link } from "react-router-dom";
import { ListVideo, Plus } from "lucide-react";

import PlaylistCard from "../../playlist/components/PlaylistCard.jsx";

function ChannelPlaylists({ playlists = [], channel, isOwner = false }) {
  // Owners can see all playlists returned by the API.
  // Visitors can see only public playlists.
  const visiblePlaylists = isOwner
    ? playlists
    : playlists.filter((playlist) => playlist.isPublic !== false);

  const hasPlaylists = visiblePlaylists.length > 0;

  return (
    <section className="mt-8">
      {/* Section header */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Playlists</h2>

          <p className="mt-1 text-sm text-gray-500">
            {isOwner
              ? "Your playlists, including collaborative playlists"
              : `Public playlists and collaborations on ${channel.name}'s channel`}
          </p>
        </div>

        {isOwner && (
          <Link
            to="/playlists"
            className="
              inline-flex shrink-0 items-center gap-2
              rounded-xl border border-white/10
              bg-[#111318] px-4 py-2
              text-sm font-medium text-gray-300
              transition hover:bg-white/10 hover:text-white
            "
          >
            <Plus size={16} />
            My Playlists
          </Link>
        )}
      </div>

      {/* Playlist grid */}
      {hasPlaylists ? (
        <div
          className="
            grid grid-cols-1 gap-x-5 gap-y-8
            sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
          "
        >
          {visiblePlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist._id || playlist.id}
              playlist={playlist}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#111214]/60 px-5 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-gray-500">
            <ListVideo size={26} />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-white">
            {isOwner ? "No playlists yet" : "No public playlists"}
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
            {isOwner
              ? "Create a playlist or collaborate on one to organize videos."
              : `${channel.name} hasn't published any public playlists or joined any public playlist collaborations yet.`}
          </p>

          {isOwner && (
            <Link
              to="/playlists"
              className="mt-5 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Manage playlists
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

export default ChannelPlaylists;

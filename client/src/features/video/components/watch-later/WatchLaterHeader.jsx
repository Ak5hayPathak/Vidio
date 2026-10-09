function WatchLaterHeader({ count }) {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-3">

        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Watch Later
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            {count} {count === 1 ? "video" : "videos"} saved
          </p>
        </div>
      </div>
    </header>
  );
}

export default WatchLaterHeader;

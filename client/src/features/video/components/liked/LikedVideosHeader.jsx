function LikedVideosHeader({ count }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        Liked Videos
      </h1>

      <p className="mt-2 text-sm text-gray-400">
        Videos you've liked and want to revisit.
      </p>

      <p className="mt-3 text-sm text-gray-500">
        {count} {count === 1 ? "video" : "videos"}
      </p>
    </div>
  );
}

export default LikedVideosHeader;

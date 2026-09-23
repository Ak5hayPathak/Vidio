function VideoDescription({ description }) {
  return (
    <div
      className="
        mt-5
        rounded-xl
        bg-[#111318]
        p-5
      "
    >
      <p
        className="
          whitespace-pre-wrap
          text-sm
          leading-6
          text-gray-300
        "
      >
        {description || "No description available."}
      </p>
    </div>
  );
}

export default VideoDescription;

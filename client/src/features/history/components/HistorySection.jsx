import VideoCard from "../../../components/videoCard/VideoCard.jsx";

function HistorySection({ title, items, onRemove }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <h2 className="mb-5 text-lg font-semibold">{title}</h2>

      <div
        className="
          grid
          grid-cols-1
          gap-x-5
          gap-y-8
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {items.map((item) => {
          const historyVideo = item.video;

          const video = {
            id: historyVideo._id,
            title: historyVideo.title,
            thumbnail: historyVideo.thumbnail,
            duration: historyVideo.duration,
            channel: historyVideo.owner?.username ?? "Unknown",
            avatar: historyVideo.owner?.avatar ?? "",
            views: historyVideo.views ?? 0,
            uploaded: historyVideo.createdAt ?? "",
          };

          return (
            <VideoCard
              key={historyVideo._id}
              video={video}
              variant="history"
              onRemove={() => onRemove(historyVideo._id)}
            />
          );
        })}
      </div>
    </section>
  );
}

export default HistorySection;

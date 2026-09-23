import HistoryVideoCard from "./HistoryVideoCard.jsx";

function HistorySection({
  title,
  items,
  onRemove,
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <h2 className="mb-5 text-lg font-semibold">
        {title}
      </h2>

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
        {items.map((item) => (
          <HistoryVideoCard
            key={`${item.video._id}-${item.watchedAt}`}
            item={item}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}

export default HistorySection;
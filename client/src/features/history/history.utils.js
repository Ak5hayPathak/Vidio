function groupHistoryByDate(history) {
  const today = [];
  const yesterday = [];
  const earlier = [];

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const startOfYesterday = new Date(startOfToday);

  startOfYesterday.setDate(
    startOfYesterday.getDate() - 1,
  );

  history.forEach((item) => {
    if (!item?.video || !item?.watchedAt) {
      return;
    }

    const watchedAt = new Date(item.watchedAt);

    if (watchedAt >= startOfToday) {
      today.push(item);
    } else if (watchedAt >= startOfYesterday) {
      yesterday.push(item);
    } else {
      earlier.push(item);
    }
  });

  return {
    today,
    yesterday,
    earlier,
  };
}

function formatHistoryVideo(item) {
  const video = item.video;

  const owner =
    video?.ownerDetails ||
    video?.owner ||
    {};

  return {
    id: video?._id,

    thumbnail: video?.thumbnail,

    title: video?.title || "Untitled video",

    channel:
      owner?.fullName ||
      owner?.username ||
      "Unknown channel",

    views: `${Number(
      video?.views || 0,
    ).toLocaleString()} views`,

    uploaded: new Date(
      item.watchedAt,
    ).toLocaleDateString(),

    duration: video?.duration,
  };
}

export {
    groupHistoryByDate,
    formatHistoryVideo,
}
const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatCount(value) {
  return numberFormatter.format(value || 0);
}

function formatChannel(channelData) {
  return {
    name: channelData?.fullName || channelData?.username || "",

    username: channelData?.username ? `@${channelData.username}` : "",

    avatar: channelData?.avatar,

    cover: channelData?.coverImage,

    about: channelData?.about || "",

    initial: (channelData?.fullName || channelData?.username || "?")
      .charAt(0)
      .toUpperCase(),
  };
}

export { formatCount, formatChannel };

import { getHlsFileUrl } from "./video.service.js";

const rewriteHlsUrl = (url) => {
  const streamMatch = url.match(
    /\/api\/v1\/videos\/[^/]+\/stream\/([a-f0-9-]+)\/(.+)$/,
  );

  if (streamMatch) {
    const [, processingId, path] = streamMatch;

    return getHlsFileUrl(processingId, path);
  }

  const directMatch = url.match(
    /\/api\/v1\/videos\/[^/]+\/([a-f0-9-]+)\/(.+)$/,
  );

  if (directMatch) {
    const [, processingId, path] = directMatch;

    return getHlsFileUrl(processingId, path);
  }

  return url;
};

export {rewriteHlsUrl};

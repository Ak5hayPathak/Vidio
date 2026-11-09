import { AVAILABLE_QUALITIES, MAX_OUTPUT_HEIGHT } from "./config.js";

const getQualityConfig = (name) => {
  return AVAILABLE_QUALITIES[name] || null;
};

const getSafeQualityConfig = (name) => {
  const config = getQualityConfig(name);

  if (!config) {
    throw new Error(`Unsupported video quality: ${name}`);
  }

  if (config.height > MAX_OUTPUT_HEIGHT) {
    throw new Error(
      `Video quality ${name} exceeds the maximum allowed height of ${MAX_OUTPUT_HEIGHT}p`
    );
  }

  return config;
};

const getSupportedQualities = (videoHeight) => {
  const supported = Object.entries(AVAILABLE_QUALITIES) // Converts an object into an array of key-value pairs.
    .filter(([, config]) => {
      return config.height <= videoHeight && config.height <= MAX_OUTPUT_HEIGHT;
    })
    .map(([name]) => name);

  // Ensure even very low-resolution videos get one rendition.
  if (supported.length === 0) {
    // AVAILABLE_QUALITIES must be in ascending order.
    const lowestAllowed = Object.entries(AVAILABLE_QUALITIES).find(
      ([, config]) => config.height <= MAX_OUTPUT_HEIGHT
    );

    return lowestAllowed ? [lowestAllowed[0]] : [];
  }

  return supported;
};

const limitQualitiesToMax = (qualities) => {
  return qualities.filter((quality) => {
    const name =
      typeof quality === "string" ? quality : quality?.name || quality?.quality;

    const config = getQualityConfig(name);

    return config && config.height <= MAX_OUTPUT_HEIGHT;
  });
};

export {
  getQualityConfig,
  getSafeQualityConfig,
  getSupportedQualities,
  limitQualitiesToMax,
};

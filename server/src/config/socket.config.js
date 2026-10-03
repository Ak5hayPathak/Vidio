const socketConfig = {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
};

export default socketConfig;
const allowedOrigins = process.env.CORS_ORIGIN.split(",").map((origin) =>
  origin.trim()
);

const socketConfig = {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
};

export default socketConfig;
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
  retryStrategy(times) {
    console.log(`Retrying connection, attempt ${times}`);
    return Math.min(times * 100, 3000);
  },
  maxRetriesPerRequest: 5,
  enableOfflineQueue: true,
  tls: {},
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

export { redis };
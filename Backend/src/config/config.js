import { config } from "dotenv";
config();

const _config = {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    MONGODB_URI: process.env.MONGODB_URI?.trim(),
    MONGODB_LOCAL_URI: process.env.MONGODB_LOCAL_URI?.trim() || "mongodb://127.0.0.1:27017/ai",
}

export default Object.freeze(_config);
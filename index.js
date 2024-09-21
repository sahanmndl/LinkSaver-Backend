import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import {rateLimiter} from "./config/rateLimiter.js";
import {logger} from "./config/logger.js";
import {connectMongoDB} from "./config/db.js";
import {connectToCacheDB} from "./cache/redis.js";
import serverRouter from "./routes/server.js";
import userRoutes from "./routes/user.js";
import linkRoutes from "./routes/link.js";
import cookieParser from "cookie-parser";

dotenv.config()

const app = express();
// app.set('trust proxy', true)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(helmet());
app.use(cookieParser());
app.use(rateLimiter)
app.use(express.json({limit: "30mb", extended: true}))

app.use("/", serverRouter)
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/link", linkRoutes)

app.listen((process.env.PORT || 8008), async () => {
    logger.info("Server is running on port " + process.env.PORT);
    await connectMongoDB()
    await connectToCacheDB()
})
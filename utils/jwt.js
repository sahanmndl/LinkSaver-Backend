import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {logger} from "../config/logger.js";

dotenv.config();

export const generateAccessToken = async (user) => {
    try {
        return jwt.sign(
            {userId: user._id, emailId: user.email},
            process.env.JWT_SECRET_KEY,
            {expiresIn: process.env.JWT_ACCESS_TOKEN_DURATION}
        );
    } catch (e) {
        logger.error("Error generateAccessToken " + e);
        throw e;
    }
}

export const generateRefreshToken = async (user) => {
    try {
        return jwt.sign(
            {userId: user._id},
            process.env.JWT_REFRESH_KEY,
            {expiresIn: process.env.JWT_REFRESH_TOKEN_DURATION}
        );
    } catch (e) {
        logger.error("Error generateRefreshToken " + e);
        throw e;
    }
}

export const verifyRefreshToken = async (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_KEY);
    } catch (e) {
        logger.error("Error verifyRefreshToken " + e);
        throw e;
    }
};
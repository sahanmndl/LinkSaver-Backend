import UserModel from "../models/user.js";
import {errorAPIResponse, successAPIResponse} from "../utils/response.js";
import {createUser, fetchUser} from "../services/user.js";
import {logger} from "../config/logger.js";
import bcrypt from "bcrypt";
import {generateAccessToken, generateRefreshToken, verifyRefreshToken} from "../utils/jwt.js";

export const registerUser = async (req, res, next) => {
    try {
        const {name, email, password} = req.body;

        const existingUser = await UserModel.findOne({email: email});
        if (existingUser) {
            return res.status(400).json(errorAPIResponse("User already exists"));
        }

        const user = await createUser({
            name: name,
            email: email,
            password: password
        });

        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json(successAPIResponse({user: user, token: accessToken}));
    } catch (e) {
        logger.error("Error in registerUser controller " + e);
        return res.status(500).json(errorAPIResponse("Error while registering user"));
    }
}

export const loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        const existingUser = await UserModel.findOne({email});
        if (!existingUser) {
            return res.status(400).json(errorAPIResponse("Invalid email or password"));
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser?.password);
        if (!isPasswordValid) {
            return res.status(400).json(errorAPIResponse("Invalid email or password"));
        }

        const accessToken = await generateAccessToken(existingUser);
        const refreshToken = await generateRefreshToken(existingUser);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json(successAPIResponse({user: existingUser, token: accessToken}));
    } catch (e) {
        logger.error("Error in loginUser controller " + e);
        return res.status(500).json(errorAPIResponse("Error while logging in user"));
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const {refreshToken} = req.cookies;
        if (!refreshToken) {
            return res.status(401).json(errorAPIResponse("Refresh token missing"));
        }

        const decoded = await verifyRefreshToken(refreshToken);
        const user = await UserModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json(errorAPIResponse("Invalid refresh token"));
        }

        const newAccessToken = await generateAccessToken(user);
        return res.status(200).json(successAPIResponse({token: newAccessToken}));
    } catch (error) {
        logger.error("Error in refreshAccessToken controller " + error);
        return res.status(403).json(errorAPIResponse("Invalid or expired refresh token"));
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('refreshToken');
        return res.status(200).json(successAPIResponse("Logged out successfully"));
    } catch (e) {
        logger.error("Error in logoutUser controller " + e);
        return res.status(500).json(errorAPIResponse("Unable to logout user"));
    }
};

export const getUserByToken = async (req, res, next) => {
    try {
        const userId = req.userId;
        const response = await fetchUser({userId});
        return res.status(200).json(successAPIResponse(response, true));
    } catch (e) {
        logger.error("Error in getUserByToken controller " + e);
        return res.status(500).json(errorAPIResponse("Error while getting user", false));
    }
}

export const getUserById = async (req, res, next) => {
    try {
        const {userId} = req.params;
        const response = await fetchUser({userId});
        return res.status(200).json(successAPIResponse(response, true));
    } catch (e) {
        logger.error("Error in getUserById controller " + e);
        return res.status(500).json(errorAPIResponse("Error while getting user", false));
    }
}
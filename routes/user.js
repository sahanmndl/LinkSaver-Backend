import express from "express";
import joi from "joi";
import {schemaValidation} from "../middleware/schemaValidation.js";
import {
    getUserById,
    getUserByToken,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser
} from "../controllers/user.js";
import {verifyAuthToken} from "../middleware/authVerification.js";

const userRoutes = express.Router();

const schemas = {
    registerUser: joi.object().keys({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required().min(8).max(255),
    }),
    loginUser: joi.object().keys({
        email: joi.string().email().required(),
        password: joi.string().required().min(8).max(255),
    }),
    getUserById: joi.object().keys({
        userId: joi.string().min(1).max(255),
    })
}

userRoutes.post('/register', schemaValidation(schemas.registerUser, "body"), registerUser);
userRoutes.post('/login', schemaValidation(schemas.loginUser, "body"), loginUser);
userRoutes.post('/refresh-token', refreshAccessToken);
userRoutes.post('/logout', logoutUser);
userRoutes.get('/', verifyAuthToken, getUserByToken);
userRoutes.get('/:userId', schemaValidation(schemas.getUserById, "params"), verifyAuthToken, getUserById);

export default userRoutes
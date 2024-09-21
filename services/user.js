import dotenv from "dotenv";
import {logger} from "../config/logger.js";
import bcrypt from "bcrypt";
import UserModel from "../models/user.js";

dotenv.config();

export const createUser = async ({name, email, password}) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await UserModel.create({
            name: name,
            email: email,
            password: hashedPassword,
        });
        await newUser.save();

        return newUser;
    } catch (e) {
        logger.error("Error createUser " + e);
        throw e;
    }
};

export const fetchUser = async ({userId}) => {
    try {
        const user = await UserModel.findById(userId)
            .select('_id email name createdAt')
            .lean()
            .exec();
        return user;
    } catch (e) {
        logger.error("Error fetchUser " + e);
        throw e;
    }
}
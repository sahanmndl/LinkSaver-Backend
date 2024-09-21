import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import {errorAPIResponse} from "../utils/response.js";

dotenv.config();

export const verifyAuthToken = async (req, res, next) => {
    const authHeader = req?.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(errorAPIResponse("Authorization token missing"));
    }
    
    try {
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json(errorAPIResponse("Unauthorized"));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = decoded?.userId || '';
        next();
    } catch (error) {
        return res.status(401).json(errorAPIResponse("Invalid or Expired token"));
    }
}
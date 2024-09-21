import express from "express";
import {checkServerStatus} from "../controllers/server.js";

const serverRouter = express.Router();
serverRouter.get('', checkServerStatus);

export default serverRouter;
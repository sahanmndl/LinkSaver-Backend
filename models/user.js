import mongoose, {Schema} from "mongoose";
import {collectionNames} from "../utils/constants.js";

const userSchema = new Schema({
    name: {type: Schema.Types.String, required: true},
    email: {type: Schema.Types.String, required: true},
    password: {type: Schema.Types.String, required: true},
}, { timestamps: true });

const UserModel = mongoose.model(collectionNames.USER, userSchema);
export default UserModel
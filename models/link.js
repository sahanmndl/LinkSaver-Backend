import mongoose, {Schema} from "mongoose";
import {collectionNames, defaultValues} from "../utils/constants.js";

const linkSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: collectionNames.USER, required: true},
    title: {type: Schema.Types.String, default: ""},
    description: {type: Schema.Types.String, default: ""},
    url: {type: Schema.Types.String, required: true, default: ""},
    domain: {type: Schema.Types.String, required: true, default: ""},
    image: {type: Schema.Types.String, default: defaultValues.URL_PREVIEW_IMAGE},
    tags: {type: [Schema.Types.String], default: []},
    visits: {type: Schema.Types.Number, default: 0},
}, {timestamps: true});

const LinkModel = mongoose.model(collectionNames.LINK, linkSchema);
export default LinkModel
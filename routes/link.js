import express from "express";
import joi from "joi";
import {
    addLink,
    deleteLinkById,
    getAllLinksForUser,
    getLinksForUserGroupedByDomain, getLinksForUserWithGivenTags,
    updateLinkById
} from "../controllers/link.js";
import {schemaValidation} from "../middleware/schemaValidation.js";
import {verifyAuthToken} from "../middleware/authVerification.js";

const linkRoutes = express.Router();

const schemas = {
    addLink: joi.object().keys({
        title: joi.string().min(0).max(256).required(),
        description: joi.string().min(0).max(1024).required(),
        url: joi.string().min(1).max(1024).required(),
        tags: joi.array().required(),
    }),
    updateLinkById: joi.object().keys({
        linkId: joi.string().min(1).max(1024).required(),
        title: joi.string().min(0).max(256),
        description: joi.string().min(0).max(1024),
        url: joi.string().min(1).max(1024),
        tags: joi.array(),
    }),
    getAllLinksForUser: joi.object().keys({
        page: joi.number().min(1).required(),
        limit: joi.number().min(12).max(100).required(),
        sortBy: joi.string().valid('createdAt', 'updatedAt', 'visits', 'title').required(),
        sortOrder: joi.string().valid('asc', 'desc').required(),
    }),
    deleteLinkById: joi.object().keys({
        linkId: joi.string().min(1).max(1024).required(),
    }),
    getLinksForUserGroupedByDomain: joi.object().keys({
        fromDate: joi.date().required(),
        tillDate: joi.date().required(),
    }),
    getLinksForUserWithGivenTags: joi.object().keys({
        tags: joi.array().required(),
        page: joi.number().min(1).required(),
        limit: joi.number().min(12).max(100).required(),
        sortBy: joi.string().valid('createdAt', 'updatedAt', 'visits').required(),
        sortOrder: joi.string().valid('asc', 'desc').required(),
    })
}

linkRoutes.post("/", schemaValidation(schemas.addLink, "body"), verifyAuthToken, addLink);
linkRoutes.put('/', schemaValidation(schemas.updateLinkById, 'body'), verifyAuthToken, updateLinkById);
linkRoutes.get('/', schemaValidation(schemas.getAllLinksForUser, 'query'), verifyAuthToken, getAllLinksForUser);
linkRoutes.delete('/:linkId', schemaValidation(schemas.deleteLinkById, 'params'), verifyAuthToken, deleteLinkById);
linkRoutes.get('/group/domain', schemaValidation(schemas.getLinksForUserGroupedByDomain, 'query'), verifyAuthToken, getLinksForUserGroupedByDomain);
linkRoutes.get('/search/tags', schemaValidation(schemas.getLinksForUserWithGivenTags, 'query'), verifyAuthToken, getLinksForUserWithGivenTags);

export default linkRoutes;
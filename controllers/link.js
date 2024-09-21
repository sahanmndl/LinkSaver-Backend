import {
    createLink,
    deleteLink,
    fetchLinksByUserId,
    fetchLinksWithTags,
    groupLinksByDomain,
    updateLink
} from "../services/link.js";
import {errorAPIResponse, successAPIResponse} from "../utils/response.js";
import {logger} from "../config/logger.js";

export const addLink = async (req, res, next) => {
    try {
        const userId = req.userId;
        const {title, description, url, tags} = req.body;
        const response = await createLink({userId, title, description, url, tags});
        return res.status(200).json(successAPIResponse(response, true));
    } catch (e) {
        logger.error("Error in addLink " + e);
        return res.status(500).json(errorAPIResponse("Cannot create link", false));
    }
}

export const updateLinkById = async (req, res, next) => {
    try {
        const userId = req.userId;
        const {linkId, title, description, url, tags} = req.body;
        const response = await updateLink({linkId, title, description, url, tags});
        return res.status(200).json(successAPIResponse(response, true));
    } catch (e) {
        logger.error("Error in updateLinkById " + e);
        return res.status(500).json(errorAPIResponse("Cannot update link", false));
    }
}

export const getAllLinksForUser = async (req, res, next) => {
    try {
        const userId = req.userId;
        const {page, limit, sortBy, sortOrder} = req.query;
        const response = await fetchLinksByUserId({userId, page, limit, sortBy, sortOrder});
        return res.status(200).json(successAPIResponse(response, true));
    } catch (e) {
        logger.error("Error in getAllLinksForUser " + e);
        return res.status(500).json(errorAPIResponse("Cannot get links", false));
    }
}

export const deleteLinkById = async (req, res, next) => {
    try {
        const userId = req.userId;
        const {linkId} = req.params;
        const response = await deleteLink({linkId});
        return res.status(200).json(successAPIResponse(response, true));
    } catch (e) {
        logger.error("Error in deleteLinkById " + e);
        return res.status(500).json(errorAPIResponse("Cannot delete link", false));
    }
}

export const getLinksForUserGroupedByDomain = async (req, res, next) => {
    try {
        const userId = req.userId;
        const {fromDate, tillDate} = req.query;
        const response = await groupLinksByDomain({userId, fromDate, tillDate});
        return res.status(200).json(successAPIResponse(response, true));
    } catch (e) {
        logger.error("Error in getLinksForUserGroupedByDomain " + e);
        return res.status(500).json(errorAPIResponse("Cannot get links", false));
    }
}

export const getLinksForUserWithGivenTags = async (req, res, next) => {
    try {
        const userId = req.userId;
        const {tags, page, limit, sortBy, sortOrder} = req.query;
        const response = await fetchLinksWithTags({userId, tags, page, limit, sortBy, sortOrder});
        return res.status(200).json(successAPIResponse(response, true));
    } catch (e) {
        logger.error("Error in getLinksForUserWithGivenTags " + e);
        return res.status(500).json(errorAPIResponse("Cannot get links", false));
    }
}
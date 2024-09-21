import {logger} from "../config/logger.js";
import LinkModel from "../models/link.js";
import {extractDomain} from "../utils/strings.js";
import mongoose from "mongoose";
import {endOfDay, startOfDay} from "../utils/dates.js";

export const createLink = async ({userId, title, description, url, tags}) => {
    try {
        const domain = extractDomain(url);
        if (title === '') title = domain;
        
        const link = await LinkModel.create({
            userId: userId,
            title: title.trim(),
            description: description.trim(),
            url: url.trim(),
            domain: domain,
            tags: tags
        });
        await link.save();

        return link;
    } catch (e) {
        logger.error("Error in createLink " + e);
        throw e;
    }
}

export const updateLink = async ({linkId, title, description, url, tags}) => {
    try {
        const update = {}
        if (title) update.title = title;
        if (description) update.description = description;
        if (url) {
            update.url = url;
            update.domain = extractDomain(url);
        }
        if (tags) update.tags = tags;

        const updatedLink = await LinkModel.findByIdAndUpdate(linkId, update, {
            new: true
        })
            .lean()
            .exec()

        return updatedLink;
    } catch (e) {
        logger.error("Error in updateLink " + e);
        throw e;
    }
}

export const fetchLinksByUserId = async ({userId, page = 1, limit = 25, sortBy, sortOrder}) => {
    try {
        const skip = (page - 1) * limit;
        const sort = {};
        if (sortBy && (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'visits')) {
            sort[sortBy] = sortOrder && sortOrder.toLowerCase() === 'asc' ? 1 : -1;
        }

        const links = await LinkModel.find({
            userId: new mongoose.Types.ObjectId(userId)
        })
            .sort(sort)
            .skip(skip)
            .limit(limit + 1)
            .lean()
            .exec();

        const hasMore = links.length > limit;
        let result = links.slice(0, limit);
        
        return {links: result, hasMore: hasMore};
    } catch (e) {
        logger.error("Error in getAllLinksForUser " + e);
        throw e;
    }
}

export const deleteLink = async ({linkId}) => {
    try {
        const deletedLink = await LinkModel.findByIdAndDelete(linkId).lean().exec();
        return deletedLink;
    } catch (e) {
        logger.error("Error in deleteLink " + e);
        throw e;
    }
}

export const groupLinksByDomain = async ({userId, fromDate, tillDate}) => {
    try {
        const dayStart = startOfDay(fromDate);
        const dayEnd = endOfDay(tillDate);
        
        const links = await LinkModel.find({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: {$gte: dayStart, $lte: dayEnd}
        })
            .lean()
            .exec();
        
        let domainMap = new Map();
        links.forEach(link => {
            if (!domainMap.has(link?.domain)) {
                domainMap.set(link.domain, {count: 0, links: []});
            }
            domainMap.get(link?.domain).count++;
            domainMap.get(link?.domain).links.push(link);
        });
        
        let result = [];
        for (const [key, value] of domainMap) {
            result.push({
                domain: key,
                count: value.count || 0,
                links: value.links || []
            })
        }
        
        return result;
    } catch (e) {
        logger.error("Error in groupLinksByDomain " + e);
        throw e;
    }
}

export const fetchLinksWithTags = async ({userId, tags, page = 1, limit = 25, sortBy, sortOrder}) => {
    try {
        const skip = (page - 1) * limit;
        const sort = {};
        if (sortBy && (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'visits')) {
            sort[sortBy] = sortOrder && sortOrder.toLowerCase() === 'asc' ? 1 : -1;
        }
        
        const links = await LinkModel.find({
            userId: new mongoose.Types.ObjectId(userId),
            tags: {$in: tags}
        })
            .sort(sort)
            .skip(skip)
            .limit(limit + 1)
            .lean()
            .exec();

        const hasMore = links.length > limit;
        const result = links.slice(0, limit);

        return {links: result, hasMore: hasMore};
    } catch (e) {
        logger.error("Error in fetchLinksWithTags " + e);
        throw e;
    }
}
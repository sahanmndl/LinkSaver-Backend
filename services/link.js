import {logger} from "../config/logger.js";
import LinkModel from "../models/link.js";
import {extractDomain} from "../utils/strings.js";
import mongoose from "mongoose";
import {endOfDay, startOfDay} from "../utils/dates.js";
import {defaultValues} from "../utils/constants.js";
import axios from "axios";
import * as cheerio from 'cheerio';

export const createLink = async ({userId, title, description, url, tags}) => {
    try {
        const domain = extractDomain(url);
        const previewData = await extractUrlMetaData(url);

        if (title === '') {
            if (previewData.title !== '') {
                title = previewData.title;
            } else {
                title = domain;
            }
        }
        if (description === '' && previewData.description !== '') {
            description = previewData.description;
        }

        const link = await LinkModel.create({
            userId: userId,
            title: title.trim(),
            description: description.trim(),
            url: url.trim(),
            image: previewData.image,
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
            // update.visits = 0;  //TODO: When ONLY url is changed, reset the visits count; Find Link first, update then link.save()
            const previewData = await extractUrlMetaData(url);
            update.image = previewData.image;
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
        if (sortBy && (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'visits' || sortBy === 'title')) {
            sort[sortBy] = sortOrder && sortOrder.toLowerCase() === 'asc' ? 1 : -1;
        }

        const totalLinks = await LinkModel.countDocuments({
            userId: new mongoose.Types.ObjectId(userId)
        });

        const query = {
            userId: new mongoose.Types.ObjectId(userId)
        }
        const {links, hasMore} = await getPaginatedLinks({
            query: query,
            sort: sort,
            skip: skip,
            limit: limit
        });

        const totalPages = Math.ceil(totalLinks / limit);

        return {links: links, hasMore: hasMore, pages: totalPages};
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

        result.sort((a, b) => b.count - a.count);

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

        const query = {
            userId: new mongoose.Types.ObjectId(userId),
            tags: {$in: tags}
        }
        const {links, hasMore} = await getPaginatedLinks({
            query: query,
            sort: sort,
            skip: skip,
            limit: limit
        });

        return {links: links, hasMore: hasMore};
    } catch (e) {
        logger.error("Error in fetchLinksWithTags " + e);
        throw e;
    }
}

export const updateVisitCount = async ({userId, linkId}) => {
    try {
        const link = await LinkModel.findOne({
            _id: new mongoose.Types.ObjectId(linkId),
            userId: new mongoose.Types.ObjectId(userId),
        });

        if (!link) throw new Error(`Link not found`);

        link.visits = (link.visits || 0) + 1;
        await link.save();

        return link;
    } catch (e) {
        logger.error("Error in incrementLinkVisitCount " + e);
        throw e;
    }
}

const extractUrlMetaData = async (url) => {
    const previewData = {
        image: defaultValues.URL_PREVIEW_IMAGE,
        title: '',
        description: ''
    };
    try {
        const {data: html} = await axios.get(url);
        const $ = cheerio.load(html);

        const ogImage = $('meta[property="og:image"]').attr('content');
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const ogDescription = $('meta[property="og:description"]').attr('content');

        if (ogImage) previewData.image = ogImage;
        if (ogTitle) previewData.title = ogTitle;
        if (ogDescription) previewData.description = ogDescription;
    } catch (e) {
        logger.error("Error in extractUrlMetaData");
    }
    return previewData;
}

const getPaginatedLinks = async ({query, sort, skip, limit}) => {
    try {
        const links = await LinkModel
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit + 1)
            .lean()
            .exec();

        const hasMore = links.length > limit;
        const result = links.slice(0, limit);

        return {links: result, hasMore: hasMore};
    } catch (e) {
        logger.error("Error in getPaginatedLinksForUser " + e);
        throw e;
    }
}
import {AMQPConnection} from "./amqp.js";
import {logger} from "../config/logger.js";
import {amqpEvents, amqpQueues} from "../utils/constants.js";
import {updateVisitCount} from "../services/link.js";

export const connectToAMQP = async () => {
    try {
        const amqpConnection = await AMQPConnection.getInstance();
        await subscribeToLinkEvents(amqpConnection);
    } catch (e) {
        logger.error("Error connecting AMQP connection " + e);
    }
}

export const publishEvent = async (queue, event) => {
    try {
        const amqpConnection = await AMQPConnection.getInstance();
        await amqpConnection.publishMessage(queue, event);
        logger.info("Event has been published: " + event.name);
    } catch (e) {
        logger.error("Error publishing event " + e);
        throw e;
    }
};

export const subscribeToLinkEvents = async (amqpConnection) => {
    try {
        logger.info("Listening to LINK events...");
        await amqpConnection.consumeMessages(amqpQueues.LINKS, async (message) => {
            const {name} = message;
            logger.info("Received LINK event with name: " + name);

            switch (name) {
                case amqpEvents.INCREMENT_LINK_VISITS:
                    try {
                        const {userId, linkId} = message;
                        await updateVisitCount({userId, linkId});
                    } catch (e) {
                        throw e;
                    }
                    break;
                default:
                    logger.info("Default case: " + name);
            }
        });
    } catch (e) {
        logger.error("Error listenToLinkEvents: " + e);
        throw e;
    }
};
import amqp from 'amqplib';
import {setTimeout} from "node:timers/promises";
import {logger} from "../config/logger.js";
import dotenv from "dotenv";

dotenv.config();

export class AMQPConnection {
    constructor(url) {
        this.url = url;
        this.connection = null;
        this.channel = null;
        this.isConnected = false;
    }

    static instance = null;

    static async getInstance() {
        if (!AMQPConnection.instance) {
            AMQPConnection.instance = new AMQPConnection(process.env.CLOUDAMQP_URL);
            await AMQPConnection.instance.connect(5000);
        }
        return AMQPConnection.instance;
    }

    async connect(retryInterval = 5000) {
        while (!this.isConnected) {
            try {
                this.connection = await amqp.connect(`${this.url}?heartbeat=60`);

                this.connection.on('error', (err) => {
                    logger.error("AMQP connection error: " + err);
                    this.isConnected = false;
                });

                this.connection.on('close', () => {
                    logger.info("AMQP connection closed");
                    this.isConnected = false;
                    this.reconnect(retryInterval);
                });

                this.channel = await this.connection.createChannel();
                this.isConnected = true;
                logger.info("AMQP connection established");

                return this.connection;
            } catch (error) {
                logger.error("Failed to connect to AMQP: " + error);
                await new Promise(resolve => setTimeout(resolve, retryInterval));
            }
        }
    }

    async reconnect(retryInterval) {
        logger.info("Attempting to reconnect...");
        await this.connect(retryInterval);
    }

    async publishMessage(queue, message) {
        if (!this.isConnected) {
            throw new Error("Not connected to AMQP");
        }

        await this.channel.assertQueue(queue, {durable: true});
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {persistent: true});
    }

    async consumeMessages(queue, messageHandler) {
        if (!this.isConnected) {
            throw new Error("Not connected to AMQP");
        }

        await this.channel.assertQueue(queue, {durable: true});
        await this.channel.consume(queue, async (msg) => {
            if (msg) {
                try {
                    await messageHandler(JSON.parse(msg.content.toString()));
                    logger.info("Message processed successfully " + msg.content);
                    this.channel.ack(msg);
                } catch (error) {
                    logger.error("Error processing message: " + error);
                    this.channel.nack(msg, false, false);
                }
            }
        });
    }

    async checkQueue(queue) {
        if (!this.isConnected) {
            throw new Error("Not connected to AMQP");
        }

        try {
            const queueInfo = await this.channel.assertQueue(queue, {durable: true});
            logger.info(`Queue '${queue}' has ${queueInfo.messageCount} messages and ${queueInfo.consumerCount} consumers`);
            return queueInfo;
        } catch (error) {
            logger.error(`Error checking queue: ${queue}, ${error}`);
            throw error;
        }
    }

    async clearQueue(queue) {
        if (!this.isConnected) {
            throw new Error("Not connected to AMQP");
        }

        try {
            const result = await this.channel.purgeQueue(queue);
            logger.info(`Queue '${queue}' cleared, ${result.messageCount} messages deleted.`);
            return result.messageCount;
        } catch (error) {
            logger.error(`Failed to clear queue: ${queue}, ${error}`);
            throw error;
        }
    }
}

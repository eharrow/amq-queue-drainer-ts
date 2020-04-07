import * as amqplib from 'amqplib';
import { Spinner } from 'cli-spinner';
import chalk from 'chalk';
import emoji from 'node-emoji';
import { Message } from 'amqplib';

const spinner: Spinner = new Spinner('waiting.. %s ');

/**
 * The queue drainer that connects to an AMQ queue and consumes all the messages.
 */
export class Drainer {
    private url: string;
    private queue: string;
    private logMessage: boolean;
    private logMessageCsv: boolean;

    /**
     *
     * @param {string} url
     * @param {string} queue
     * @param {boolean} logMessage
     */
    public constructor(url: string, queue: string, logMessage: boolean, logMessageCsv: boolean) {
        this.url = url;
        this.queue = queue;
        this.logMessage = logMessage;
        this.logMessageCsv = logMessageCsv;
    }

    private async createConnection(url: string) {
        console.log(`connecting to... ${chalk.blue(url)}`);

        const connection = await amqplib.connect(url);

        connection.on('error', (err: Error) => {
            if (err.message !== 'Connection closing') {
                console.error('[AMQP] conn error', err.message);
            }
        });

        connection.on('close', (err: Error) => {
            console.error('[AMQP] conn closed.  Will reconnect...', err.message);
            return setTimeout(this.createConnection.bind(null, url), 1000);
        });

        return connection;
    }
    private async setup(processFn: Function) {
        try {
            // const connection = await amqplib.connect(this.url);

            // connection.on('error', (err: Error) => {
            //     if (err.message !== "Connection closing") {
            //         console.error("[AMQP] conn error", err.message);
            //     }
            // });

            // connection.on('close', (err: Error) => {
            //     console.error("[AMQP] conn closed.  Will reconnect...", err.message);

            // });
            const connection = await this.createConnection(this.url);

            const channel = await connection.createChannel();

            try {
                const ok = await channel.checkQueue(this.queue);

                if (ok) {
                    console.info(
                        ` [*] Waiting for messages in ${chalk.bold.red(
                            this.queue,
                        )}. ${chalk.inverse.greenBright('CTRL+C')} to exit`,
                    );
                    spinner.start();
                    const logMessage = this.logMessage;
                    const logMessageCsv = this.logMessageCsv;

                    return processFn(channel, logMessageCsv, logMessage);
                }
            } catch (err) {
                console.error('Error when connecting to the queue', err);
            }
        } catch (error) {
            console.error('Error connecting to server', error.message);
        }
    }

    private log(count: number, message: Message, logMessage: boolean, logMessageCsv: boolean) {
        if (logMessageCsv) {
            // add header when first entry
            if (count === 1) {
                console.debug(
                    '----8<---------8<---------8<--------8<---------8<--------8<----------',
                );
                console.debug(`"Message #","Message Body"`);
            }
            console.debug(`${count},"${message.content.toString()}"`);
        } else {
            if (logMessage) {
                console.debug(message.content.toString());
            }
            console.info(`message: ${count} ${emoji.get('white_check_mark')}`);
        }
    }

    /**
     * connect and consume messages
     */
    public async consumeMessages() {
        return this.setup(
            (channel: amqplib.Channel, logMessageCsv: boolean, logMessage: boolean) => {
                let count = 0;

                return channel
                    .consume(this.queue, (message: Message) => {
                        spinner.stop(true);

                        if (message != null) {
                            count++;
                            this.log(count, message, logMessage, logMessageCsv);
                            spinner.start();
                            return channel.ack(message);
                        }
                    })
                    .catch((error: any) => {
                        console.error('error when consuming a message', error);
                    });
            },
        );
    }

    /**
     * connect and consume a specific number of messages
     */
    public async consumeNmessages(numToConsume: number) {
        return this.setup(
            (channel: amqplib.Channel, logMessageCsv: boolean, logMessage: boolean) => {
                let count = 0;
                const consumers = [];

                for (let i: number = 0; i < numToConsume; i++) {
                    consumers.push(channel.get(this.queue));
                }
                return Promise.all(consumers)
                    .then((messages) => {
                        spinner.stop(true);

                        messages.forEach((message) => {
                            if (message) {
                                count++;
                                this.log(count, message, logMessage, logMessageCsv);
                                //spinner.start();
                                return channel.ack(message);
                            }
                        });

                        channel.close().then(() => {
                            return process.exit(0);
                        });
                    })
                    .catch((error: any) => {
                        console.error('error when consuming a message', error);
                    });
            },
        );
    }
}

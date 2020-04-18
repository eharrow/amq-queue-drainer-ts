"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib = __importStar(require("amqplib"));
const cli_spinner_1 = require("cli-spinner");
const chalk_1 = __importDefault(require("chalk"));
const node_emoji_1 = __importDefault(require("node-emoji"));
/**
 * The queue drainer that connects to an AMQ queue and consumes all the messages.
 */
class Drainer {
    /**
     *
     * @param {string} url
     * @param {string} queue
     * @param {boolean} logMessage
     */
    constructor(url, queue, logMessage, logMessageCsv, i18n) {
        this.url = url;
        this.queue = queue;
        this.logMessage = logMessage;
        this.logMessageCsv = logMessageCsv;
        this.i18n = i18n;
        this.spinner = new cli_spinner_1.Spinner("waiting.. %s ");
    }
    /**
     * connect and consume messages
     */
    consumeMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setupAndProcess((channel, logMessageCsv, logMessage) => {
                let count = 0;
                return channel
                    .consume(this.queue, (message) => {
                    this.spinner.stop(true);
                    if (message != null) {
                        count++;
                        this.log(count, message, logMessage, logMessageCsv);
                        this.spinner.start();
                        return channel.ack(message);
                    }
                })
                    .catch((error) => {
                    console.error("error when consuming a message", error);
                });
            }).catch((err) => console.error("oh oh", err));
        });
    }
    /**
     * connect and consume a specific number of messages
     */
    consumeNmessages(numToConsume) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setupAndProcess((channel, logMessageCsv, logMessage) => {
                let count = 0;
                const consumers = [];
                for (let i = 0; i < numToConsume; i++) {
                    consumers.push(channel.get(this.queue));
                }
                return Promise.all(consumers)
                    .then((messages) => {
                    this.spinner.stop(true);
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
                    .catch((error) => {
                    console.error("error when consuming a message", error);
                });
            });
        });
    }
    setupAndProcess(processFn) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield this.createConnection(this.url);
                const channel = yield connection.createChannel();
                try {
                    const ok = yield channel.checkQueue(this.queue);
                    if (ok) {
                        console.info(` [*] Waiting for messages in ${chalk_1.default.bold.red(this.queue)}. ${chalk_1.default.inverse.greenBright("CTRL-C")} to exit`);
                        this.spinner.start();
                        const logMessage = this.logMessage;
                        const logMessageCsv = this.logMessageCsv;
                        return processFn(channel, logMessageCsv, logMessage);
                    }
                }
                catch (err) {
                    console.error(`${this.i18n.__("connect.error.msg.queue")}`, err);
                }
            }
            catch (error) {
                console.error(`${this.i18n.__("connect.error.msg.server")}`, error.message);
            }
        });
    }
    createConnection(url) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`${this.i18n.__("connect.msg")} ${chalk_1.default.blue(url)}`);
            const connection = yield amqplib.connect(url);
            connection.on("error", (err) => {
                if (err.message !== "Connection closing") {
                    console.error("[AMQP] conn error", err.message);
                }
            });
            connection.on("close", (err) => {
                // when the queue does not exist don't bother reconnecting
                if (!err.message.search("404")) {
                    console.error("[AMQP] conn closed.  Will reconnect...", err.message);
                    return setTimeout(this.createConnection.bind(null, url), 1000);
                }
            });
            return connection;
        });
    }
    log(count, message, logMessage, logMessageCsv) {
        if (logMessageCsv) {
            // add header when first entry
            if (count === 1) {
                console.debug("----8<---------8<---------8<--------8<---------8<--------8<----------");
                console.debug(`${this.i18n.__("log.csv.header")}`);
            }
            console.debug(`${count},"${message.content.toString()}"`);
        }
        else {
            if (logMessage) {
                console.debug(message.content.toString());
            }
            console.info(`message: ${count} ${node_emoji_1.default.get("white_check_mark")}`);
        }
    }
}
exports.Drainer = Drainer;

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Drainer = void 0;
const chalk_1 = __importDefault(require("chalk"));
const cli_spinner_1 = require("cli-spinner");
const node_emoji_1 = __importDefault(require("node-emoji"));
const connectionHelper_1 = require("./connectionHelper");
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
                const connection = yield new connectionHelper_1.ConnectionHelper(this.i18n).createConnection(this.url);
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

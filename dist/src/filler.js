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
exports.Filler = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const connectionHelper_1 = require("./connectionHelper");
/**
 * The queue drainer that connects to an AMQ queue and consumes all the messages.
 */
class Filler {
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
    }
    /**
     * connect and consume messages
     */
    publishMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.setupAndProcess();
            while (true) {
                yield this.publish(channel);
            }
        });
    }
    publish(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            {
                const onCancel = () => {
                    process.exit(0);
                };
                const response = yield prompts_1.default({
                    type: "text",
                    name: "value",
                    message: "Message to publish?",
                    validate: (value) => value.length === 0 ? `You need to enter something` : true,
                }, { onCancel });
                const buf = Buffer.from(response.value, "utf8");
                Promise.resolve(channel.publish(this.exchange(), this.routingKey(), buf));
            }
        });
    }
    exchange() {
        return "";
    }
    routingKey() {
        return this.queue;
    }
    setupAndProcess() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield new connectionHelper_1.ConnectionHelper(this.i18n).createConnection(this.url);
                const channel = yield connection.createChannel();
                try {
                    const ok = yield channel.checkQueue(this.queue);
                    if (ok) {
                        console.info(` [*] Waiting for messages to send to ${chalk_1.default.bold.red(this.queue)}. ${chalk_1.default.inverse.greenBright("CTRL-C")} to exit`);
                        return Promise.resolve(channel);
                    }
                    else {
                        return Promise.reject("no channel");
                    }
                }
                catch (err) {
                    console.error(`${this.i18n.__("connect.error.msg.queue")}`, err);
                    return Promise.reject("no channel");
                }
            }
            catch (error) {
                console.error(`${this.i18n.__("connect.error.msg.server")}`, error.message);
                return Promise.reject("no channel");
            }
        });
    }
}
exports.Filler = Filler;

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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const amqplib = __importStar(require("amqplib"));
class ConnectionHelper {
    constructor(i18n) {
        this.i18n = i18n;
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
}
exports.ConnectionHelper = ConnectionHelper;

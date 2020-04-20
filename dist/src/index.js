"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
const commander_1 = __importDefault(require("commander"));
const drainer_1 = require("./drainer");
const filler_1 = require("./filler");
const package_json_1 = __importDefault(require("../package.json"));
const i18n_1 = __importDefault(require("i18n"));
i18n_1.default.configure({
    directory: __dirname + "/locales",
    objectNotation: true,
});
// example queue names
const QUEUE_1 = "queue_1";
const QUEUE_2 = "queue_2";
const QUEUE_3 = "queue_3";
const BANNER_QDRAINER = "Q Drainer";
const BANNER_QFILLER = "Q Filler";
const fonts = figlet_1.default.fontsSync();
const font = fonts[Math.floor(Math.random() * fonts.length)];
commander_1.default
    .version(package_json_1.default.version)
    .option("-m --mode <mode>", "mode to drain or fill", "drain")
    .option("-h, --host <host>", "rabbit host", "localhost")
    .option("-p, --port <port>", "rabbit port", "5672")
    .option("-v, --vhost <vhost>", "virtual host", "")
    .option("-u, --user <user>", "rabbit user")
    .option("-c, --password <password>", "rabbit password")
    .option("-q, --queue <queue>", `queue name e.g. ${QUEUE_1}, ${QUEUE_2} or ${QUEUE_3}`, "test_q")
    .option("-l, --log-message", "log the dequeued message.  This will be ignored if used with --log-message-csv")
    .option("--log-message-csv", "log the dequeued message as CSV")
    .option("-n, --num-to-consume [num>", "The number of messages to consume and if absent consume all")
    .parse(process.argv);
const host = commander_1.default.host;
const port = commander_1.default.port;
const user = commander_1.default.user;
const password = commander_1.default.password;
const vhost = commander_1.default.vhost;
const queue = commander_1.default.queue;
const logMessage = commander_1.default.logMessage;
const logMessageCsv = commander_1.default.logMessageCsv;
const numToConsume = commander_1.default.numToConsume || 0;
const mode = process.env.MODE || commander_1.default.mode;
const isFillerMode = mode === "fill";
if (isFillerMode) {
    console.log(chalk_1.default.green(figlet_1.default.textSync(BANNER_QFILLER, { font, horizontalLayout: "full" })));
}
else {
    console.log(chalk_1.default.yellow(figlet_1.default.textSync(BANNER_QDRAINER, { font, horizontalLayout: "full" })));
}
if (!(host && port && queue)) {
    console.error(i18n_1.default.__("err_missingArgs"));
    console.error(commander_1.default.help());
    process.exit(1);
}
let url;
if (user && password) {
    url = `amqp://${user}:${password}@${host}:${port}`.concat(vhost ? `/${vhost}` : "");
}
else {
    url = `amqp://${host}:${port}`.concat(vhost ? `/${vhost}` : "");
}
if (isFillerMode) {
    const filler = new filler_1.Filler(url, queue, logMessage, logMessageCsv, i18n_1.default);
    if (numToConsume === 0) {
        filler.publishMessage().catch((err) => console.info("oh oh"));
    }
}
else {
    const drainer = new drainer_1.Drainer(url, queue, logMessage, logMessageCsv, i18n_1.default);
    if (numToConsume === 0) {
        drainer.consumeMessages().catch((err) => console.info("oh oh"));
    }
    else {
        drainer
            .consumeNmessages(numToConsume)
            .catch((err) => console.info("oh oh"));
    }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
const commander_1 = require("commander");
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
const program = new commander_1.Command();
program
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
const options = program.opts();
const host = options.host;
const port = options.port;
const user = options.user;
const password = options.password;
const vhost = options.vhost;
const queue = options.queue;
const logMessage = options.logMessage;
const logMessageCsv = options.logMessageCsv;
const numToConsume = options.numToConsume || 0;
const mode = process.env.MODE || options.mode;
const isFillerMode = mode === "fill";
if (isFillerMode) {
    console.log(chalk_1.default.green(figlet_1.default.textSync(BANNER_QFILLER, { font, horizontalLayout: "full" })));
}
else {
    console.log(chalk_1.default.yellow(figlet_1.default.textSync(BANNER_QDRAINER, { font, horizontalLayout: "full" })));
}
if (!(host && port && queue)) {
    console.error(i18n_1.default.__("err_missingArgs"));
    console.error(program.help());
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

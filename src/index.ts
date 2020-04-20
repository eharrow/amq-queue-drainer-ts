import chalk from "chalk";
import figlet from "figlet";
import program from "commander";
import { Drainer } from "./drainer";
import { Filler } from "./filler";
import pkg from "../package.json";
import i18n from "i18n";
i18n.configure({
  directory: __dirname + "/locales",
  objectNotation: true,
});

// example queue names
const QUEUE_1 = "queue_1";
const QUEUE_2 = "queue_2";
const QUEUE_3 = "queue_3";

const BANNER_QDRAINER = "Q Drainer";
const BANNER_QFILLER = "Q Filler";

const fonts = figlet.fontsSync();
const font = fonts[Math.floor(Math.random() * fonts.length)];

program
  .version(pkg.version)
  .option("-m --mode <mode>", "mode to drain or fill", "drain")
  .option("-h, --host <host>", "rabbit host", "localhost")
  .option("-p, --port <port>", "rabbit port", "5672")
  .option("-v, --vhost <vhost>", "virtual host", "")
  .option("-u, --user <user>", "rabbit user")
  .option("-c, --password <password>", "rabbit password")
  .option(
    "-q, --queue <queue>",
    `queue name e.g. ${QUEUE_1}, ${QUEUE_2} or ${QUEUE_3}`,
    "test_q"
  )
  .option(
    "-l, --log-message",
    "log the dequeued message.  This will be ignored if used with --log-message-csv"
  )
  .option("--log-message-csv", "log the dequeued message as CSV")
  .option(
    "-n, --num-to-consume [num>",
    "The number of messages to consume and if absent consume all"
  )
  .parse(process.argv);

const host: string = program.host;
const port: string = program.port;
const user: string = program.user;
const password: string = program.password;
const vhost: string = program.vhost;
const queue: string = program.queue;
const logMessage: boolean = program.logMessage;
const logMessageCsv: boolean = program.logMessageCsv;
const numToConsume: number = program.numToConsume || 0;
const mode: string = process.env.MODE || program.mode;
const isFillerMode = mode === "fill";

if (isFillerMode) {
  console.log(
    chalk.green(
      figlet.textSync(BANNER_QFILLER, { font, horizontalLayout: "full" })
    )
  );
} else {
  console.log(
    chalk.yellow(
      figlet.textSync(BANNER_QDRAINER, { font, horizontalLayout: "full" })
    )
  );
}

if (!(host && port && queue)) {
  console.error(i18n.__("err_missingArgs"));
  console.error(program.help());
  process.exit(1);
}

let url;

if (user && password) {
  url = `amqp://${user}:${password}@${host}:${port}`.concat(
    vhost ? `/${vhost}` : ""
  );
} else {
  url = `amqp://${host}:${port}`.concat(vhost ? `/${vhost}` : "");
}

if (isFillerMode) {
  const filler: Filler = new Filler(
    url,
    queue,
    logMessage,
    logMessageCsv,
    i18n
  );
  if (numToConsume === 0) {
    filler.publishMessage().catch((err) => console.info("oh oh"));
  }
} else {
  const drainer: Drainer = new Drainer(
    url,
    queue,
    logMessage,
    logMessageCsv,
    i18n
  );
  if (numToConsume === 0) {
    drainer.consumeMessages().catch((err) => console.info("oh oh"));
  } else {
    drainer
      .consumeNmessages(numToConsume)
      .catch((err) => console.info("oh oh"));
  }
}

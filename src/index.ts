import chalk from 'chalk';
import figlet from 'figlet';
import program from 'commander';
import { Drainer } from './drainer';
import pkg from '../package.json';

// example queue names
const ACCEPTED_Q = 'accepted';
const SETTLEMENT_EXEC_Q = 'settlement_executed';
const PROCESSED_Q = 'payment_processed';

const fonts = figlet.fontsSync();
const font = fonts[Math.floor(Math.random() * fonts.length)];
console.log(chalk.yellow(figlet.textSync('Q Drainer', { font, horizontalLayout: 'full' })));

program
    .version(pkg.version)
    .option('-h, --host <host>', 'rabbit host', 'localhost')
    .option('-p, --port <port>', 'rabbit port', 5672)
    .option('-v, --vhost <vhost>', 'virtual host', '')
    .option('-u, --user <user>', 'rabbit user')
    .option('-c, --password <password>', 'rabbit password')
    .option(
        '-q, --queue <queue>',
        `queue name e.g. ${ACCEPTED_Q}, ${SETTLEMENT_EXEC_Q} or ${PROCESSED_Q}`, 'test_q'
    )
    .option('-l, --log-message', 'log the dequeued message.  This will be ignored if used with --log-message-csv')
    .option('--log-message-csv', 'log the dequeued message as CSV')
    .option('-n, --num-to-consume [num>', 'The number of messages to consume and if absent consume all')
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

if (!(host && port && queue)) {
    console.error('one or more missing arguments');
    console.error(program.help());
    process.exit(1);
}

let url;

if (user && password) {
    url = `amqp://${user}:${password}@${host}:${port}`.concat(vhost ? `/${vhost}` : '');
} else {
    url = `amqp://${host}:${port}`.concat(vhost ? `/${vhost}` : '');
}

const drainer: Drainer = new Drainer(url, queue, logMessage, logMessageCsv);
if (numToConsume === 0) {
    drainer.consumeMessages();
} else {
    drainer.consumeNmessages(numToConsume);
}

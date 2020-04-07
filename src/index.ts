import chalk from 'chalk';
import figlet from 'figlet';
import program from 'commander';
import { Drainer } from './drainer';
import pkg from '../package.json';

// example queue names
const QUEUE_1 = 'queue_1';
const QUEUE_2 = 'queue_2';
const QUEUE_3 = 'queue_3';

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
        `queue name e.g. ${QUEUE_1}, ${QUEUE_2} or ${QUEUE_3}`, 'test_q'
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

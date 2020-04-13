import * as amqplib from "amqplib";
import { Spinner } from "cli-spinner";
import chalk from "chalk";
import emoji from "node-emoji";
import { Message } from "amqplib";
import i18n from "i18n";
import { promises } from "dns";

/**
 * The queue drainer that connects to an AMQ queue and consumes all the messages.
 */
export class Drainer {
  private url: string;
  private queue: string;
  private logMessage: boolean;
  private logMessageCsv: boolean;
  private i18n: any;
  private spinner: Spinner;

  /**
   *
   * @param {string} url
   * @param {string} queue
   * @param {boolean} logMessage
   */
  public constructor(
    url: string,
    queue: string,
    logMessage: boolean,
    logMessageCsv: boolean,
    i18n: any
  ) {
    this.url = url;
    this.queue = queue;
    this.logMessage = logMessage;
    this.logMessageCsv = logMessageCsv;
    this.i18n = i18n;
    this.spinner = new Spinner("waiting.. %s ");
  }

    /**
   * connect and consume messages
   */
  public async consumeMessages() {
    return this.setupAndProcess(
      (
        channel: amqplib.Channel,
        logMessageCsv: boolean,
        logMessage: boolean
      ) => {
        let count = 0;

        return channel
          .consume(this.queue, (message: Message) => {
            this.spinner.stop(true);

            if (message != null) {
              count++;
              this.log(count, message, logMessage, logMessageCsv);
              this.spinner.start();
              return channel.ack(message);
            }
          })
          .catch((error: any) => {
            console.error("error when consuming a message", error);
          });
      }
    ).catch(err => console.error('oh oh', err));
  }

  /**
   * connect and consume a specific number of messages
   */
  public async consumeNmessages(numToConsume: number) {
    return this.setupAndProcess(
      (
        channel: amqplib.Channel,
        logMessageCsv: boolean,
        logMessage: boolean
      ) => {
        let count = 0;
        const consumers = [];

        for (let i: number = 0; i < numToConsume; i++) {
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
          .catch((error: any) => {
            console.error("error when consuming a message", error);
          });
      }
    )
  }

  private async setupAndProcess(processFn: Function) {
    try {
      const connection = await this.createConnection(this.url);
      const channel = await connection.createChannel();

      try {
        const ok = await channel.checkQueue(this.queue);

        if (ok) {
          console.info(
            ` [*] Waiting for messages in ${chalk.bold.red(
              this.queue
            )}. ${chalk.inverse.greenBright("CTRL+C")} to exit`
          );
          this.spinner.start();
          const logMessage = this.logMessage;
          const logMessageCsv = this.logMessageCsv;

          return processFn(channel, logMessageCsv, logMessage);
        }
      } catch (err) {
        console.error(`${this.i18n.__("connect.error.msg.queue")}`, err);
      }
    } catch (error) {
      console.error(
        `${this.i18n.__("connect.error.msg.server")}`,
        error.message
      );
    }
  }

  private async createConnection(url: string) {
    console.log(`${this.i18n.__("connect.msg")} ${chalk.blue(url)}`);

    const connection = await amqplib.connect(url);

    connection.on("error", (err: Error) => {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });

    connection.on("close", (err: Error) => {
      // when the queue does not exist don't bother reconnecting
      if (!err.message.search('404')) {
        console.error("[AMQP] conn closed.  Will reconnect...", err.message);
        return setTimeout(this.createConnection.bind(null, url), 1000);
      }
    });

    return connection;
  }

  private log(
    count: number,
    message: Message,
    logMessage: boolean,
    logMessageCsv: boolean
  ) {
    if (logMessageCsv) {
      // add header when first entry
      if (count === 1) {
        console.debug(
          "----8<---------8<---------8<--------8<---------8<--------8<----------"
        );
        console.debug(`${this.i18n.__("log.csv.header")}`);
      }
      console.debug(`${count},"${message.content.toString()}"`);
    } else {
      if (logMessage) {
        console.debug(message.content.toString());
      }
      console.info(`message: ${count} ${emoji.get("white_check_mark")}`);
    }
  }
}

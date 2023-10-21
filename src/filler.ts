import * as amqplib from "amqplib";
import chalk from "chalk";
import prompt from "prompts";
import { ConnectionHelper } from "./connectionHelper";

/**
 * The queue drainer that connects to an AMQ queue and consumes all the messages.
 */
export class Filler {
  private url: string;
  private queue: string;
  private logMessage: boolean;
  private logMessageCsv: boolean;
  private i18n: any;

  /**
   * @param {string} url
   * @param {string} queue
   * @param {boolean} logMessage
   */
  public constructor(
    url: string,
    queue: string,
    logMessage: boolean,
    logMessageCsv: boolean,
    i18n: any,
  ) {
    this.url = url;
    this.queue = queue;
    this.logMessage = logMessage;
    this.logMessageCsv = logMessageCsv;
    this.i18n = i18n;
  }

  /**
   * connect and consume messages
   */
  public async publishMessage() {
    const channel: amqplib.Channel = await this.setupAndProcess();
    while (true) {
      await this.publish(channel);
    }
  }

  private async publish(channel: amqplib.Channel) {
    {
      const onCancel = () => {
        process.exit(0);
      };
      const response: any = await prompt(
        {
          type: "text",
          name: "value",
          message: "Message to publish?",
          validate: (value) => value.length === 0 ? `You need to enter something` : true,
        },
        { onCancel },
      );

      const buf: Buffer = Buffer.from(response.value, "utf8");
      Promise.resolve(channel.publish(this.exchange(), this.routingKey(), buf));
    }
  }
  private exchange(): string {
    return "";
  }

  private routingKey(): string {
    return this.queue;
  }

  private async setupAndProcess(): Promise<any> {
    try {
      const connection = await new ConnectionHelper(this.i18n).createConnection(
        this.url,
      );
      const channel = await connection.createChannel();

      try {
        const ok = await channel.checkQueue(this.queue);

        if (ok) {
          console.info(
            ` [*] Waiting for messages to send to ${
              chalk.bold.red(
                this.queue,
              )
            }. ${chalk.inverse.greenBright("CTRL-C")} to exit`,
          );
          return Promise.resolve(channel);
        } else {
          return Promise.reject("no channel");
        }
      } catch (err) {
        console.error(`${this.i18n.__("connect.error.msg.queue")}`, err);
        return Promise.reject("no channel");
      }
    } catch (error) {
      console.error(
        `${this.i18n.__("connect.error.msg.server")}`,
        error.message,
      );
      return Promise.reject("no channel");
    }
  }
}

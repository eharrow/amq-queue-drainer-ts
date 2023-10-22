import * as amqplib from "amqplib";
import chalk from "chalk";
import {I18n} from "i18n";

export class ConnectionHelper {
  private i18n: I18n;

  constructor(i18n: I18n) {
    this.i18n = i18n;
  }
  public async createConnection(url: string) {
    console.log(`${this.i18n.__("connect.msg")} ${chalk.blue(url)}`);

    const connection = await amqplib.connect(url);

    connection.on("error", (err: Error) => {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });

    connection.on("close", (err: Error) => {
      // when the queue does not exist don't bother reconnecting
      if (!err.message.search("404")) {
        console.error("[AMQP] conn closed.  Will reconnect...", err.message);
        return setTimeout(this.createConnection.bind(null, url), 1000);
      }
    });

    return connection;
  }
}

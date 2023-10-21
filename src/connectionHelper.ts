import * as amqplib from "amqplib";
import chalk from "chalk";

export class ConnectionHelper {
  private i18n: any;

  constructor(i18n: any) {
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

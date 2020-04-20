import * as amqplib from "amqplib";
export declare class ConnectionHelper {
    private i18n;
    constructor(i18n: any);
    createConnection(url: string): Promise<amqplib.Connection>;
}

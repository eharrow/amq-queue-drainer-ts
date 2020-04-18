/**
 * The queue drainer that connects to an AMQ queue and consumes all the messages.
 */
export declare class Drainer {
    private url;
    private queue;
    private logMessage;
    private logMessageCsv;
    private i18n;
    private spinner;
    /**
     *
     * @param {string} url
     * @param {string} queue
     * @param {boolean} logMessage
     */
    constructor(url: string, queue: string, logMessage: boolean, logMessageCsv: boolean, i18n: any);
    /**
     * connect and consume messages
     */
    consumeMessages(): Promise<any>;
    /**
     * connect and consume a specific number of messages
     */
    consumeNmessages(numToConsume: number): Promise<any>;
    private setupAndProcess;
    private createConnection;
    private log;
}

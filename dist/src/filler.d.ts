/**
 * The queue drainer that connects to an AMQ queue and consumes all the messages.
 */
export declare class Filler {
    private url;
    private queue;
    private logMessage;
    private logMessageCsv;
    private i18n;
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
    publishMessage(): Promise<void>;
    private doit;
    private setupAndProcess;
    private createConnection;
}

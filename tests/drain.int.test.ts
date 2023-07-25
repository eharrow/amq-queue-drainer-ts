import {
  TestContainer,
  StartedTestContainer,
  StoppedTestContainer,
  GenericContainer
} from "testcontainers";
import { describe, expect, test } from '@jest/globals';
import * as amqplib from "amqplib";
import { Drainer } from "../src/drainer";
import { Filler } from "../src/filler";

import i18n from "i18n";

jest.mock('i18n');

describe('basic test', () => {
  const container: TestContainer = new GenericContainer("rabbitmq:3-management");
  let startedContainer: StartedTestContainer;
  let host: string;
  let port: number;
  let url: string;
  let ch: amqplib.Channel;
  const q = 'hello';


  beforeAll(async () => {
    startedContainer = await container.withExposedPorts(5672).start();
    host = startedContainer.getHost();
    port = startedContainer.getFirstMappedPort();
    url = `amqp://${host}:${port}`;
    const connection = await amqplib.connect(url);
    ch = await connection.createChannel();
    ch.assertQueue(q, { durable: false });
  }, 60000);

  afterAll(async () => {
    await startedContainer.stop();
  }, 60000);

  test('it consumes a message from the queue', async () => {
    const msg = 'Hello World!';

    for (let index = 0; index < 100; index++) {
      ch.sendToQueue(q, Buffer.from(msg));
      // console.log(` [${index}] Sent %s`, msg);
    }

    const drainer: Drainer = new Drainer(
      url,
      q,
      true,
      false,
      i18n
    );

    await drainer.consumeNmessages(1);

    const msgCount = (await ch.purgeQueue(q)).messageCount;
    // console.log(`purging queue of ${msgCount} messages`);
    expect(msgCount).toBe(99);
  }, 5000);

  test('it publishes a message to the queue', async () => {
    const msg = 'Hello World!';

    for (let index = 0; index < 100; index++) {
      ch.sendToQueue(q, Buffer.from(msg));
      // console.log(` [${index}] Sent %s`, msg);
    }
    const filler: Filler = new Filler(
      url,
      q,
      true,
      false,
      i18n
    );
  await filler.publishMessage(msg);
});

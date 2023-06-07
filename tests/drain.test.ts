import {
  TestContainer,
  StartedTestContainer,
  StoppedTestContainer,
  GenericContainer
} from "testcontainers";
import { describe, expect, test } from '@jest/globals';
import * as amqplib from "amqplib";
import { Drainer } from "../src/drainer";
import i18n from "i18n";

jest.mock('i18n');

describe('basic test', () => {
  const container: TestContainer = new GenericContainer("rabbitmq:3-management");
  let startedContainer: StartedTestContainer;

  beforeAll(async () => {
    startedContainer = await container.withExposedPorts(5672).start();
  }, 10000);

  afterAll(async () => {
    await startedContainer.stop();
  });

  test('it consumes a message from the queue', async () => {
    const host: string = startedContainer.getHost();
    const port = startedContainer.getFirstMappedPort();
    // console.log(`host ${host}, port ${port}`);
    const url = `amqp://${host}:${port}`;
    const connection = await amqplib.connect(url);
    const ch = await connection.createChannel();
    const q = 'hello';
    const msg = 'Hello World!';

    ch.assertQueue(q, { durable: false });
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
});

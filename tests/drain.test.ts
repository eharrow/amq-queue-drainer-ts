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
  let stoppedContainer: StoppedTestContainer;

  beforeAll(async () => {
    startedContainer = await container.withExposedPorts(5672).start();
  }, 10000);

  afterAll(async () => {
    stoppedContainer = await startedContainer.stop();
  });

  test('adds 1 + 2 to equal 3', async () => {
    const host: string = startedContainer.getHost();
    const port = startedContainer.getFirstMappedPort();
    console.log(`host ${host}, port ${port}`);
    const url = `amqp://${host}:${port}`;
    const connection = await amqplib.connect(url);
    const ch = await connection.createChannel();
    const q = 'hello';
    const msg = 'Hello World!';

    ch.assertQueue(q, { durable: false });
    ch.sendToQueue(q, Buffer.from(msg));
    console.log(' [x] Sent %s', msg);

    const drainer: Drainer = new Drainer(
      url,
      q,
      true,
      false,
      i18n
    );

    drainer
      .consumeMessages()
      .catch((err) => console.info("oh oh"));

    expect(1 + 2).toBe(3);
  }, 5000);
});

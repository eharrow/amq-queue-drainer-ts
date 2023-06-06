import {
  TestContainer,
  StartedTestContainer,
  StoppedTestContainer,
  GenericContainer
} from "testcontainers";
import { describe, expect, test } from '@jest/globals';



describe('basic test', () => {
  const container: TestContainer = new GenericContainer("rabbitmq:3-management");
  let startedContainer: StartedTestContainer;
  let stoppedContainer: StoppedTestContainer;

  beforeAll(async () => {
    startedContainer = await container.start();
    stoppedContainer = await startedContainer.stop();
  });

  test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
  });
});

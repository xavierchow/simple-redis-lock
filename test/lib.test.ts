import * as srl from '../src/index';
import { v4 as uuid } from 'uuid';
import Redis from 'ioredis';
import { setTimeout } from 'timers/promises';
const { acquire } = srl;

describe('SimpleRedisLock', () => {
  const redis = new Redis();
  afterAll(() => {
    return redis.disconnect();
  });

  it('should be able to acquire the lock', async () => {
    const ttlInSec = 10;
    const resource = uuid();
    const res = await acquire(redis, resource, ttlInSec);
    expect(res).toHaveProperty('release');
  });

  it('should be able to prevent others to acquire the lock', async () => {
    const ttlInSec = 10;
    const resource = uuid();
    const res = await acquire(redis, resource, ttlInSec);
    expect(res).toHaveProperty('release');
    const secondTry = await acquire(redis, resource, ttlInSec);
    expect(secondTry).toBeUndefined();
  });

  it('should be able to acquire after expiring', async () => {
    const ttlInSec = 1;
    const resource = uuid();
    await acquire(redis, resource, ttlInSec);
    await setTimeout(1500);
    const secondTry = await acquire(redis, resource, ttlInSec);
    expect(secondTry).toHaveProperty('release');
  });

  it('should be able to release', async () => {
    const resource = uuid();
    const lock = await acquire(redis, resource, 10);
    expect(lock).toHaveProperty('release');
    if (lock) {
      await lock.release();
    }
    const secondTry = await acquire(redis, resource, 10);
    expect(secondTry).toHaveProperty('release');
  });

  it('should only load script once', async () => {
    const resource = uuid();
    const spy = jest.spyOn(redis, 'script');
    const lock = await acquire(redis, resource, 10);

    expect(lock).toHaveProperty('release');
    if (lock) {
      await lock.release();
    }
    const lock2 = await acquire(redis, resource, 10);
    expect(lock2).toHaveProperty('release');
    if (lock2) {
      await lock2.release();
    }
    expect(spy.mock.calls.length).toBeLessThan(2);

    spy.mockRestore();
  });

  it('should be able to reload if script is flushed by redis', async () => {
    const mock = jest.spyOn(redis, 'script').mockResolvedValueOnce('non-existing-hash');
    const resource = uuid();
    const lock = await acquire(redis, resource, 10);

    expect(lock).toHaveProperty('release');
    if (!lock) {
      throw new Error('failed to lock');
    }
    const r = await lock.release();
    expect(r).toBe(1);
    mock.mockRestore();
  });
});

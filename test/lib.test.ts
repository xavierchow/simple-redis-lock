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
});

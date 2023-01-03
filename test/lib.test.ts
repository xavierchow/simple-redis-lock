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
    expect(res).toBe(true);
  });

  it('should be able to prevent others to acquire the lock', async () => {
    const ttlInSec = 10;
    const resource = uuid();
    const res = await acquire(redis, resource, ttlInSec);
    expect(res).toBe(true);
    const secondTry = await acquire(redis, resource, ttlInSec);
    expect(secondTry).toBe(false);
  });

  it('should be able to acquire after expiring', async () => {
    const ttlInSec = 1;
    const resource = uuid();
    await acquire(redis, resource, ttlInSec);
    await setTimeout(1500);
    const secondTry = await acquire(redis, resource, ttlInSec);
    expect(secondTry).toBe(true);
  });

  it('should be able to release', async () => {
    // input: redis? id of resource? the token?
    // output: true/false?
    // await release(redis, resource, token???)
  });
});

/*
 * const t = setInterval(...)
 * clearInterval(t)
 *
 * const subscription = rxjs.subscribe(...)
 * subscription.unsubscribe(...)
 *
 * const disposer = doSth(...)
 * disposer.dispose(...)
 *
 *
 */

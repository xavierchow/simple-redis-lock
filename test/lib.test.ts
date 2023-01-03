import * as srl from '../src/index';
import { v4 as uuid } from 'uuid';
import Redis from 'ioredis';
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
});

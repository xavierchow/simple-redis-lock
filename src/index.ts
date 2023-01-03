import { Redis } from 'ioredis';
import { v4 as uuid } from 'uuid';
/**
 * A simple lock with redis implementing the pattern: https://redis.io/commands/set/
 * It does not aim to have a fault tolerant solution like redlock as we do not have such use case.
 * */

export async function acquire(redis: Redis, resource: string, ttl: number) {
  const token = uuid();
  const lockKey = `lock:${resource}`;
  const ack = await redis.set(lockKey, token, 'EX', ttl, 'NX');
  if (ack !== 'OK') {
    return false;
  }
  return true;
}

async function release(redis: Redis, token: string, lockKey: string) {}

import { Redis } from 'ioredis';
import { v4 as uuid } from 'uuid';
/**
 * A simple lock with redis implementing the pattern: https://redis.io/commands/set/
 * It does not aim to have a fault tolerant solution like redlock as we do not have such use case.
 * */
let sha: string | null;
export async function acquire(redis: Redis, resource: string, ttl: number) {
  const token = uuid();
  const lockKey = `lock:${resource}`;
  const ack = await redis.set(lockKey, token, 'EX', ttl, 'NX');

  if (ack !== 'OK') {
    return;
  }
  return {
    release: () => release.call(null, redis, token, lockKey),
  };
}

async function release(redis: Redis, token: string, lockKey: string): Promise<number> {
  if (!sha) {
    sha = await loadScript(redis);
  }
  try {
    const numOfKeys = 1;
    return (await redis.evalsha(sha, numOfKeys, lockKey, token)) as number;
  } catch (err: any) {
    if (err.message && err.message.includes('NOSCRIPT')) {
      sha = null;
      return release(redis, token, lockKey);
    }
    throw err;
  }
}

async function loadScript(redis: Redis) {
  const script = `if redis.call("get",KEYS[1]) == ARGV[1]
      then
          return redis.call("del",KEYS[1])
      else
          return 0
      end`;
  const sha = await redis.script('LOAD', script);
  return sha as string;
}

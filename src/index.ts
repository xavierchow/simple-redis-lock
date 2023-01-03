import { Redis } from "ioredis";
/**
 * A simple lock with redis implementing the pattern: https://redis.io/commands/set/
 * It does not aim to have a fault tolerant solution like redlock as we do not have such use case.
 * */

export async function acquire(redis: Redis, resource: string, ttl: number) {}

async function release(redis: Redis, token: string, lockKey: string) {}

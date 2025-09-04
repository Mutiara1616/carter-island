// src/lib/cache.ts
import Redis, { RedisOptions } from 'ioredis'

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue }

class CacheService {
  private redis: Redis | null = null

  constructor() {
    const url = process.env.REDIS_URL

    if (url) {
      this.redis = new Redis(url, {
        lazyConnect: true,
        maxRetriesPerRequest: 3,
      } satisfies RedisOptions)
    } else if (process.env.REDIS_HOST) {
      const options: RedisOptions = {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT ?? 6379),
        lazyConnect: true,
        maxRetriesPerRequest: 3,
      }
      this.redis = new Redis(options)
    }
  }

  async connect(): Promise<void> {
    if (!this.redis) return
    if ((this.redis as any).status === 'ready') return
    await this.redis.connect()
  }

  async get<T = JsonValue>(key: string): Promise<T | null> {
    if (!this.redis) return null
    try {
      const value = await this.redis.get(key)
      if (value == null) return null
      try {
        return JSON.parse(value) as T
      } catch {
        return value as unknown as T
      }
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    if (!this.redis) return
    try {
      const payload = typeof value === 'string' ? value : JSON.stringify(value)
      await this.redis.setex(key, ttlSeconds, payload)
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const keys = [
      `user:${userId}`,
      `user:sessions:${userId}`,
      `user:activities:${userId}`,
    ]
    await Promise.all(keys.map((k) => this.del(k)))
  }

  async quit(): Promise<void> {
    if (!this.redis) return
    try {
      await this.redis.quit()
    } catch {
      await this.redis.disconnect()
    } finally {
      this.redis = null
    }
  }
}

declare global {
  var __cacheService: CacheService | undefined
}

export const cache: CacheService =
  globalThis.__cacheService ?? new CacheService()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__cacheService = cache
}

import { createClient, RedisClientType } from "redis";

class CartCache {
  private client: RedisClientType | null = null;

  async init() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error("Missing REDIS_URL environment variable.");
    }

    this.client = createClient({ url: redisUrl });
    await this.client.connect();
  }

  private key(sessionId: string, tableId: string) {
    return `cart:${sessionId}:${tableId}`;
  }

  async getCart(sessionId: string, tableId: string) {
    if (!this.client) throw new Error("Redis has not been initialized.");
    const raw = await this.client.get(this.key(sessionId, tableId));
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async setCart(sessionId: string, tableId: string, items: any[]) {
    if (!this.client) throw new Error("Redis has not been initialized.");
    await this.client.set(this.key(sessionId, tableId), JSON.stringify(items), { EX: 60 * 60 * 24 });
  }

  async clearCart(sessionId: string, tableId: string) {
    if (!this.client) throw new Error("Redis has not been initialized.");
    await this.client.del(this.key(sessionId, tableId));
  }
}

const cartCache = new CartCache();

export default cartCache;

import crypto from "node:crypto";
import pg from "pg";

const { Pool } = pg;

const seedData = {
  categories: [
    ["Starters", "The First Trial", "此"],
    ["Main Course", "The Grand Feast", "鵠"],
    ["Desserts", "Sweet Victory", "魂"],
    ["Beverages", "Elixirs & Potions", "･､"],
  ],
};

const menuByCategory: Record<string, any[]> = {
  Starters: [
    ["Spicy Chicken Wings", "8 pcs, blazing hot...", 299, "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&q=80", false, true],
    ["Crispy Calamari", "Golden fried squid rings with aioli", 279, "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=800&q=80", false, false],
    ["Paneer Tikka Bites", "Charred cottage cheese cubes and mint dip", 259, null, true, true],
  ],
  "Main Course": [
    ["Legendary Burger", "Juicy beef, special sauce, crispy lettuce...", 349, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80", true, false],
    ["Orbit Pizza", "Pepperoni, cheese, and cosmic dust", 499, "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80", false, false],
    ["Smoky Alfredo Pasta", "Creamy sauce with grilled mushrooms", 389, "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80", false, false],
    ["Dragon Noodles", "Wok tossed noodles with chili garlic", 329, null, false, true],
  ],
  Desserts: [
    ["Galaxy Cake", "Chocolate cake with stardust sprinkles", 199, "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", true, false],
    ["Molten Lava Cup", "Warm gooey chocolate center", 219, "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80", false, false],
  ],
  Beverages: [
    ["Nebula Mojito", "Mint, lime, fizz and a glowing finish", 149, "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80", false, false],
    ["Cold Brew Tonic", "Citrus tonic with smooth cold brew", 169, "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80", false, false],
    ["Mango Lassi", "Classic yogurt shake with mango pulp", 129, null, false, false],
  ],
};

const hashPassword = (password: string, salt?: string) => {
  const effectiveSalt = salt ?? crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, effectiveSalt, 120_000, 64, "sha512").toString("hex");
  return `${effectiveSalt}:${hash}`;
};

const encodeCredential = (value: string) => {
  try {
    return encodeURIComponent(decodeURIComponent(value));
  } catch {
    return encodeURIComponent(value);
  }
};

const normalizeDatabaseUrl = (rawConnectionString: string) => {
  const trimmed = rawConnectionString.trim();
  const withProtocol = trimmed.startsWith("//") ? `postgresql:${trimmed}` : trimmed;
  const url = new URL(withProtocol);

  if (url.username) {
    url.username = encodeCredential(url.username);
  }

  if (url.password) {
    url.password = encodeCredential(url.password);
  }

  return url.toString();
};

class Database {
  private pool: pg.Pool | null = null;

  async init() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("Missing DATABASE_URL environment variable.");
    }

    this.pool = new Pool({ connectionString: normalizeDatabaseUrl(connectionString) });

    await this.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT
      );

      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES categories(id),
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        image_url TEXT,
        is_top_quest BOOLEAN DEFAULT FALSE,
        is_spicy BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        number INTEGER NOT NULL,
        status TEXT DEFAULT 'available',
        qr_code TEXT
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        table_id INTEGER REFERENCES tables(id),
        customer_name TEXT,
        status TEXT DEFAULT 'new',
        total_amount INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        menu_item_id INTEGER REFERENCES menu_items(id),
        quantity INTEGER,
        notes TEXT,
        price INTEGER
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('manager', 'owner')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const categoryCount = await this.one<{ count: string }>("SELECT COUNT(*) AS count FROM categories");
    if (Number(categoryCount?.count ?? 0) === 0) {
      const categoryIds = new Map<string, number>();

      for (const [name, description, icon] of seedData.categories) {
        const result = await this.one<{ id: number }>(
          "INSERT INTO categories (name, description, icon) VALUES ($1, $2, $3) RETURNING id",
          [name, description, icon],
        );
        if (result) {
          categoryIds.set(name, result.id);
        }
      }

      for (const [categoryName, items] of Object.entries(menuByCategory)) {
        const categoryId = categoryIds.get(categoryName);
        if (!categoryId) continue;

        for (const item of items) {
          await this.query(
            "INSERT INTO menu_items (category_id, name, description, price, image_url, is_top_quest, is_spicy) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [categoryId, ...item],
          );
        }
      }

      for (let i = 1; i <= 10; i++) {
        await this.query("INSERT INTO tables (number, status) VALUES ($1, 'available')", [i]);
      }
    }

    await this.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      [
        process.env.MANAGER_USERNAME ?? "manager",
        hashPassword(process.env.MANAGER_PASSWORD ?? "manager123"),
        "manager",
      ],
    );

    await this.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      [
        process.env.OWNER_USERNAME ?? "owner",
        hashPassword(process.env.OWNER_PASSWORD ?? "owner123"),
        "owner",
      ],
    );
  }

  async query<T = any>(text: string, values?: any[]): Promise<T[]> {
    if (!this.pool) throw new Error("Database has not been initialized.");
    const result = await this.pool.query(text, values);
    return result.rows as T[];
  }

  async one<T = any>(text: string, values?: any[]): Promise<T | null> {
    const rows = await this.query<T>(text, values);
    return rows[0] ?? null;
  }
}

const db = new Database();

export { hashPassword };
export default db;

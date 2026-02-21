import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "orbitdine.db");

let db: Database.Database;

try {
  db = new Database(dbPath);
  db.prepare("SELECT 1").get();
} catch {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  db = new Database(dbPath);
}

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image_url TEXT,
    is_top_quest BOOLEAN DEFAULT 0,
    is_spicy BOOLEAN DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number INTEGER NOT NULL,
    status TEXT DEFAULT 'available',
    qr_code TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER,
    customer_name TEXT,
    status TEXT DEFAULT 'new',
    total_amount INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    menu_item_id INTEGER,
    quantity INTEGER,
    notes TEXT,
    price INTEGER,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
  );
`);

const categoriesCount = db.prepare("SELECT count(*) as count FROM categories").get() as { count: number };

if (categoriesCount.count === 0) {
  const insertCategory = db.prepare("INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)");
  const insertItem = db.prepare("INSERT INTO menu_items (category_id, name, description, price, image_url, is_top_quest, is_spicy) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const insertTable = db.prepare("INSERT INTO tables (number, status) VALUES (?, ?)");

  const startersId = insertCategory.run("Starters", "The First Trial", "🍟").lastInsertRowid;
  const mainsId = insertCategory.run("Main Course", "The Grand Feast", "🍔").lastInsertRowid;
  const dessertsId = insertCategory.run("Desserts", "Sweet Victory", "🍰").lastInsertRowid;
  const beveragesId = insertCategory.run("Beverages", "Elixirs & Potions", "🥤").lastInsertRowid;

  insertItem.run(startersId, "Spicy Chicken Wings", "8 pcs, blazing hot...", 299, "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&q=80", 0, 1);
  insertItem.run(mainsId, "Legendary Burger", "Juicy beef, special sauce, crispy lettuce...", 349, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80", 1, 0);
  insertItem.run(mainsId, "Orbit Pizza", "Pepperoni, cheese, and cosmic dust", 499, "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80", 0, 0);
  insertItem.run(dessertsId, "Galaxy Cake", "Chocolate cake with stardust sprinkles", 199, "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", 1, 0);
  insertItem.run(beveragesId, "Nebula Mojito", "Mint, lime, fizz and a glowing finish", 149, "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80", 0, 0);

  for (let i = 1; i <= 10; i++) {
    insertTable.run(i, "available");
  }
}

export default db;

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import db from "./src/db/index.js";
import cartCache from "./src/cache/redis.js";
import admin from "firebase-admin";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type Role = "manager" | "owner";

const loadFirebaseServiceAccount = () => {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountPath) {
    const raw = fs.readFileSync(serviceAccountPath, "utf-8");
    return JSON.parse(raw);
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.",
    );
  }

  return { projectId, clientEmail, privateKey };
};

async function startServer() {
  await db.init();
  await cartCache.init();

  if (!admin.apps.length) {
    const serviceAccount = loadFirebaseServiceAccount();
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 3000;

  app.use(express.json());

  const getSessionId = (req: any) => String(req.headers["x-session-id"] || "anon");

  const requireAuth = (roles?: Role[]) => async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      res.status(401).json({ error: "No token provided." });
      return;
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      if (roles && !roles.includes(decodedToken.role as Role)) {
        res.status(403).json({ error: "Insufficient permissions." });
        return;
      }

      req.user = decodedToken;
      next();
    } catch {
      res.status(401).json({ error: "Invalid token." });
    }
  };

  app.get("/api/menu", async (_req, res) => {
    try {
      const categories = await db.query("SELECT * FROM categories ORDER BY id ASC");
      const items = await db.query("SELECT * FROM menu_items ORDER BY id ASC");

      const menu = categories.map((cat: any) => ({
        ...cat,
        items: items.filter((item: any) => item.category_id === cat.id),
      }));

      res.json(menu);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch menu" });
    }
  });

  app.get("/api/tables", requireAuth(["manager", "owner"]), async (_req, res) => {
    try {
      const tables = await db.query("SELECT * FROM tables ORDER BY number ASC");
      res.json(tables);
    } catch {
      res.status(500).json({ error: "Failed to fetch tables" });
    }
  });

  app.get("/api/cart/:tableId", async (req, res) => {
    const sessionId = getSessionId(req);
    const tableId = String(req.params.tableId);

    try {
      const items = await cartCache.getCart(sessionId, tableId);
      res.json({ items });
    } catch {
      res.status(500).json({ error: "Failed to load cart." });
    }
  });

  app.put("/api/cart/:tableId", async (req, res) => {
    const sessionId = getSessionId(req);
    const tableId = String(req.params.tableId);
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    try {
      await cartCache.setCart(sessionId, tableId, items);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to save cart." });
    }
  });

  app.delete("/api/cart/:tableId", async (req, res) => {
    const sessionId = getSessionId(req);
    const tableId = String(req.params.tableId);

    try {
      await cartCache.clearCart(sessionId, tableId);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to clear cart." });
    }
  });

  app.post("/api/orders", async (req, res) => {
    const { tableId, items, total, customerName, geofence } = req.body;

    try {
      if (geofence?.enabled && geofence.distanceMeters > geofence.allowedMeters) {
        res.status(403).json({ error: "You appear to be outside the restaurant geofence." });
        return;
      }

      const order = await db.one<{ id: number }>(
        "INSERT INTO orders (table_id, status, total_amount, customer_name) VALUES ($1, $2, $3, $4) RETURNING id",
        [tableId, "new", total, customerName || "Guest"],
      );

      if (!order?.id) {
        res.status(500).json({ error: "Failed to create order." });
        return;
      }

      for (const item of items) {
        await db.query(
          "INSERT INTO order_items (order_id, menu_item_id, quantity, notes, price) VALUES ($1, $2, $3, $4, $5)",
          [order.id, item.id, item.quantity, item.notes || "", item.price],
        );
      }

      await db.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [tableId]);

      const newOrder = {
        id: order.id,
        tableId,
        status: "new",
        total,
        items,
        createdAt: new Date().toISOString(),
      };

      io.emit("new_order", newOrder);
      res.json({ success: true, orderId: order.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders/:id/print", requireAuth(["manager", "owner"]), async (req, res) => {
    const { id } = req.params;
    try {
      const order = await db.one(
        `SELECT o.*, t.number AS table_number
         FROM orders o
         JOIN tables t ON o.table_id = t.id
         WHERE o.id = $1`,
        [id],
      );

      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      const items = await db.query(
        `SELECT oi.*, mi.name
         FROM order_items oi
         JOIN menu_items mi ON oi.menu_item_id = mi.id
         WHERE oi.order_id = $1`,
        [id],
      );

      res.json({ ...order, items });
    } catch {
      res.status(500).json({ error: "Failed to load printable order" });
    }
  });

  app.get("/api/orders/active", requireAuth(["manager", "owner"]), async (_req, res) => {
    try {
      const orders = await db.query(
        `SELECT o.*, t.number AS table_number
         FROM orders o
         JOIN tables t ON o.table_id = t.id
         WHERE o.status != 'completed'
         ORDER BY o.created_at DESC`,
      );

      for (const order of orders as any[]) {
        order.items = await db.query(
          `SELECT oi.*, mi.name
           FROM order_items oi
           JOIN menu_items mi ON oi.menu_item_id = mi.id
           WHERE oi.order_id = $1`,
          [order.id],
        );
      }

      res.json(orders);
    } catch {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders/:id/status", requireAuth(["manager", "owner"]), async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    try {
      await db.query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
      io.emit("order_updated", { id, status });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    const { id } = req.params;

    try {
      const order = await db.one(
        `SELECT o.*, t.number AS table_number
         FROM orders o
         JOIN tables t ON o.table_id = t.id
         WHERE o.id = $1`,
        [id],
      ) as any;

      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      order.items = await db.query(
        `SELECT oi.*, mi.name
         FROM order_items oi
         JOIN menu_items mi ON oi.menu_item_id = mi.id
         WHERE oi.order_id = $1`,
        [id],
      );

      res.json(order);
    } catch {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/tables/:id/request", async (req, res) => {
    const { type } = req.body;
    const { id } = req.params;

    try {
      if (type === "bill") {
        await db.query("UPDATE tables SET status = 'bill_requested' WHERE id = $1", [id]);
      }
      io.emit("table_request", { tableId: id, type });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to request bill" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server: httpServer } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
  }

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("join_table", (tableId) => {
      socket.join(`table_${tableId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

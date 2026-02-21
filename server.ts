import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import db from "./src/db/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Get Menu
  app.get("/api/menu", (req, res) => {
    try {
      const categories = db.prepare("SELECT * FROM categories").all();
      const items = db.prepare("SELECT * FROM menu_items").all();
      
      const menu = categories.map((cat: any) => ({
        ...cat,
        items: items.filter((item: any) => item.category_id === cat.id)
      }));
      
      res.json(menu);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch menu" });
    }
  });

  // Get Tables
  app.get("/api/tables", (req, res) => {
    try {
      const tables = db.prepare("SELECT * FROM tables").all();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tables" });
    }
  });

  // Create Order
  app.post("/api/orders", (req, res) => {
    const { tableId, items, total, customerName } = req.body;
    
    try {
      const insertOrder = db.prepare(
        "INSERT INTO orders (table_id, status, total_amount, customer_name) VALUES (?, ?, ?, ?)"
      );
      const result = insertOrder.run(tableId, 'new', total, customerName || 'Guest');
      const orderId = result.lastInsertRowid;

      const insertItem = db.prepare(
        "INSERT INTO order_items (order_id, menu_item_id, quantity, notes, price) VALUES (?, ?, ?, ?, ?)"
      );

      items.forEach((item: any) => {
        insertItem.run(orderId, item.id, item.quantity, item.notes || '', item.price);
      });

      // Update table status
      db.prepare("UPDATE tables SET status = 'occupied' WHERE id = ?").run(tableId);

      const newOrder = {
        id: orderId,
        tableId,
        status: 'new',
        total,
        items,
        createdAt: new Date().toISOString()
      };

      // Notify managers
      io.emit("new_order", newOrder);
      
      res.json({ success: true, orderId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Get Active Orders (Manager)
  app.get("/api/orders/active", (req, res) => {
    try {
      const orders = db.prepare(`
        SELECT o.*, t.number as table_number 
        FROM orders o 
        JOIN tables t ON o.table_id = t.id 
        WHERE o.status != 'completed'
        ORDER BY o.created_at DESC
      `).all();
      
      // Get items for these orders
      const orderIds = orders.map((o: any) => o.id);
      if (orderIds.length > 0) {
        const items = db.prepare(`
          SELECT oi.*, mi.name 
          FROM order_items oi
          JOIN menu_items mi ON oi.menu_item_id = mi.id
          WHERE oi.order_id IN (${orderIds.join(',')})
        `).all();

        orders.forEach((order: any) => {
          order.items = items.filter((i: any) => i.order_id === order.id);
        });
      }

      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Update Order Status
  app.post("/api/orders/:id/status", (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    
    try {
      db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
      io.emit("order_updated", { id, status });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // Get single order status/details
  app.get('/api/orders/:id', (req, res) => {
    const { id } = req.params;

    try {
      const order = db.prepare(`
        SELECT o.*, t.number as table_number
        FROM orders o
        JOIN tables t ON o.table_id = t.id
        WHERE o.id = ?
      `).get(id) as any;

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const items = db.prepare(`
        SELECT oi.*, mi.name
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = ?
      `).all(id);

      order.items = items;
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  });

  // Call Waiter / Bill
  app.post("/api/tables/:id/request", (req, res) => {
    const { type } = req.body; // 'bill' or 'help'
    const { id } = req.params;
    
    try {
      if (type === 'bill') {
        db.prepare("UPDATE tables SET status = 'bill_requested' WHERE id = ?").run(id);
      }
      io.emit("table_request", { tableId: id, type });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to request bill" });
    }
  });


  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server: httpServer } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving (simplified for this demo)
    app.use(express.static(path.join(__dirname, "dist")));
  }

  // --- Socket.io ---
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

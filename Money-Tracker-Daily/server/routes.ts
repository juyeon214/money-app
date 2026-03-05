import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Transactions
  app.get(api.transactions.list.path, async (req, res) => {
    const month = req.query.month as string | undefined;
    const q = req.query.q as string | undefined;
    const txs = await storage.getTransactions(month, q);
    res.json(txs);
  });

  app.post(api.transactions.create.path, async (req, res) => {
    try {
      const inputSchema = api.transactions.create.input.extend({
        amount: z.coerce.number(),
        splitCount: z.coerce.number().default(1),
        isFixed: z.coerce.boolean().default(false),
      });
      const input = inputSchema.parse(req.body);
      const created = await storage.createTransaction(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.delete(api.transactions.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await storage.deleteTransaction(id);
    res.status(204).end();
  });

  // Monthly Targets
  app.get(api.targets.get.path, async (req, res) => {
    const target = await storage.getMonthlyTarget(req.params.month);
    res.json(target || null);
  });

  app.post(api.targets.set.path, async (req, res) => {
    try {
      const inputSchema = api.targets.set.input.extend({
        targetAmount: z.coerce.number()
      });
      const input = inputSchema.parse(req.body);
      const target = await storage.setMonthlyTarget(input);
      res.json(target);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  // Memos
  app.get(api.memos.list.path, async (req, res) => {
    const month = req.query.month as string | undefined;
    const ms = await storage.getMemos(month);
    res.json(ms);
  });

  app.post(api.memos.create.path, async (req, res) => {
    try {
      const input = api.memos.create.input.parse(req.body);
      const created = await storage.createMemo(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.patch(api.memos.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const input = api.memos.update.input.parse(req.body);
      const updated = await storage.updateMemo(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.delete(api.memos.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await storage.deleteMemo(id);
    res.status(204).end();
  });

  return httpServer;
}

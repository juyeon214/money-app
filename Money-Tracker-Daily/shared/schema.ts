import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'income' or 'expense'
  amount: integer("amount").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  description: text("description").notNull(),
  category: text("category").notNull(),
  isFixed: boolean("is_fixed").default(false).notNull(),
  splitCount: integer("split_count").default(1).notNull(),
});

export const monthlyTargets = pgTable("monthly_targets", {
  id: serial("id").primaryKey(),
  month: text("month").notNull().unique(), // YYYY-MM
  targetAmount: integer("target_amount").notNull(),
});

export const memos = pgTable("memos", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  month: text("month").notNull(), // YYYY-MM
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const insertMonthlyTargetSchema = createInsertSchema(monthlyTargets).omit({ id: true });
export const insertMemoSchema = createInsertSchema(memos).omit({ id: true });

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type MonthlyTarget = typeof monthlyTargets.$inferSelect;
export type InsertMonthlyTarget = z.infer<typeof insertMonthlyTargetSchema>;

export type Memo = typeof memos.$inferSelect;
export type InsertMemo = z.infer<typeof insertMemoSchema>;

export type CreateTransactionRequest = InsertTransaction;
export type UpdateTransactionRequest = Partial<InsertTransaction>;

export type CreateMonthlyTargetRequest = InsertMonthlyTarget;
export type UpdateMonthlyTargetRequest = Partial<InsertMonthlyTarget>;

export type CreateMemoRequest = InsertMemo;
export type UpdateMemoRequest = Partial<InsertMemo>;

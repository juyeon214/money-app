import { db } from "./db";
import {
  transactions,
  monthlyTargets,
  memos,
  type CreateTransactionRequest,
  type Transaction,
  type MonthlyTarget,
  type CreateMonthlyTargetRequest,
  type Memo,
  type CreateMemoRequest,
  type UpdateMemoRequest
} from "@shared/schema";
import { eq, like, desc, and } from "drizzle-orm";

export interface IStorage {
  // Transactions
  getTransactions(month?: string, search?: string): Promise<Transaction[]>;
  createTransaction(transaction: CreateTransactionRequest): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;

  // Monthly Targets
  getMonthlyTarget(month: string): Promise<MonthlyTarget | undefined>;
  setMonthlyTarget(target: CreateMonthlyTargetRequest): Promise<MonthlyTarget>;

  // Memos
  getMemos(month?: string): Promise<Memo[]>;
  createMemo(memo: CreateMemoRequest): Promise<Memo>;
  updateMemo(id: number, updates: UpdateMemoRequest): Promise<Memo>;
  deleteMemo(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Transactions
  async getTransactions(month?: string, search?: string): Promise<Transaction[]> {
    let conditions = [];
    if (month) {
      conditions.push(like(transactions.date, `${month}%`));
    }
    if (search) {
      conditions.push(like(transactions.description, `%${search}%`));
    }

    if (conditions.length > 0) {
      return await db.select().from(transactions).where(and(...conditions)).orderBy(desc(transactions.date));
    }
    return await db.select().from(transactions).orderBy(desc(transactions.date));
  }

  async createTransaction(transaction: CreateTransactionRequest): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(transaction).returning();
    return created;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  // Monthly Targets
  async getMonthlyTarget(month: string): Promise<MonthlyTarget | undefined> {
    const [target] = await db.select().from(monthlyTargets).where(eq(monthlyTargets.month, month));
    return target;
  }

  async setMonthlyTarget(target: CreateMonthlyTargetRequest): Promise<MonthlyTarget> {
    const existing = await this.getMonthlyTarget(target.month);
    if (existing) {
      const [updated] = await db.update(monthlyTargets)
        .set({ targetAmount: target.targetAmount })
        .where(eq(monthlyTargets.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(monthlyTargets).values(target).returning();
      return created;
    }
  }

  // Memos
  async getMemos(month?: string): Promise<Memo[]> {
    if (month) {
      return await db.select().from(memos).where(eq(memos.month, month)).orderBy(desc(memos.id));
    }
    return await db.select().from(memos).orderBy(desc(memos.id));
  }

  async createMemo(memo: CreateMemoRequest): Promise<Memo> {
    const [created] = await db.insert(memos).values(memo).returning();
    return created;
  }

  async updateMemo(id: number, updates: UpdateMemoRequest): Promise<Memo> {
    const [updated] = await db.update(memos)
      .set(updates)
      .where(eq(memos.id, id))
      .returning();
    return updated;
  }

  async deleteMemo(id: number): Promise<void> {
    await db.delete(memos).where(eq(memos.id, id));
  }
}

export const storage = new DatabaseStorage();

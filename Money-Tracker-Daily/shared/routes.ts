import { z } from 'zod';
import { insertTransactionSchema, insertMonthlyTargetSchema, insertMemoSchema, transactions, monthlyTargets, memos } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/transactions' as const,
      input: z.object({
        month: z.string().optional(), // YYYY-MM
        q: z.string().optional(), // Search query
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/transactions' as const,
      input: insertTransactionSchema,
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/transactions/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  targets: {
    get: {
      method: 'GET' as const,
      path: '/api/targets/:month' as const,
      responses: {
        200: z.custom<typeof monthlyTargets.$inferSelect>().nullable(),
      },
    },
    set: {
      method: 'POST' as const,
      path: '/api/targets' as const,
      input: insertMonthlyTargetSchema,
      responses: {
        200: z.custom<typeof monthlyTargets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  memos: {
    list: {
      method: 'GET' as const,
      path: '/api/memos' as const,
      input: z.object({
        month: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof memos.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/memos' as const,
      input: insertMemoSchema,
      responses: {
        201: z.custom<typeof memos.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/memos/:id' as const,
      input: z.object({ isCompleted: z.boolean() }),
      responses: {
        200: z.custom<typeof memos.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/memos/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

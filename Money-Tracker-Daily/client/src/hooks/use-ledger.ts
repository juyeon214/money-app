import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// --- TRANSACTIONS ---

export function useTransactions(month?: string, query?: string) {
  return useQuery({
    queryKey: [api.transactions.list.path, month, query],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (month) searchParams.append("month", month);
      if (query) searchParams.append("q", query);
      
      const url = `${api.transactions.list.path}?${searchParams.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.transactions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.transactions.create.input>) => {
      const validated = api.transactions.create.input.parse(data);
      const res = await fetch(api.transactions.create.path, {
        method: api.transactions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create transaction");
      return api.transactions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.transactions.delete.path, { id });
      const res = await fetch(url, { 
        method: api.transactions.delete.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete transaction");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
    },
  });
}

// --- TARGETS ---

export function useMonthlyTarget(month: string) {
  return useQuery({
    queryKey: [api.targets.get.path, month],
    queryFn: async () => {
      const url = buildUrl(api.targets.get.path, { month });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch target");
      return api.targets.get.responses[200].parse(await res.json());
    },
    enabled: !!month,
  });
}

export function useSetMonthlyTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.targets.set.input>) => {
      const validated = api.targets.set.input.parse(data);
      const res = await fetch(api.targets.set.path, {
        method: api.targets.set.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to set target");
      return api.targets.set.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.targets.get.path] });
    },
  });
}

// --- MEMOS ---

export function useMemos(month?: string) {
  return useQuery({
    queryKey: [api.memos.list.path, month],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (month) searchParams.append("month", month);
      
      const url = `${api.memos.list.path}?${searchParams.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch memos");
      return api.memos.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.memos.create.input>) => {
      const validated = api.memos.create.input.parse(data);
      const res = await fetch(api.memos.create.path, {
        method: api.memos.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create memo");
      return api.memos.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.memos.list.path] });
    },
  });
}

export function useUpdateMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number, isCompleted: boolean }) => {
      const url = buildUrl(api.memos.update.path, { id });
      const res = await fetch(url, {
        method: api.memos.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update memo");
      return api.memos.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.memos.list.path] });
    },
  });
}

export function useDeleteMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.memos.delete.path, { id });
      const res = await fetch(url, { 
        method: api.memos.delete.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete memo");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.memos.list.path] });
    },
  });
}

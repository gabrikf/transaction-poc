import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

export const router = Router();

const transactionSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  description: z.string().min(1, "Description is required"),
});

const storedTransactionSchema = transactionSchema.extend({
  id: z.string().uuid(),
});

export type Transaction = z.infer<typeof storedTransactionSchema>;

export const data: Transaction[] = [];

router.get("/", (_req, res) => {
  res.json({ message: "API is running" });
});

router.post("/transactions", (req, res) => {
  const parsed = transactionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors });
  }

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    ...parsed.data,
  };

  data.push(transaction);
  res.status(201).json(transaction);
});

router.get("/transactions", (_req, res) => {
  return res.status(200).json(data);
});

router.get("/transactions/:id", (req, res) => {
  const { id } = req.params;
  const transaction = data.find((t) => t.id === id);
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  return res.status(200).json(transaction);
});

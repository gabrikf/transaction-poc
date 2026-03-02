import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

export const router = Router();

const transactionSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  amount: z.number().positive("Amount must be a positive number"),
  description: z.string().min(1, "Description is required"),
});

export type Transaction = z.infer<typeof transactionSchema>;

const data: Transaction[] = [];

// Example route with Zod validation

router.get("/", (_req, res) => {
  res.json({ message: "API is running" });
});

router.post("/transaction", (req, res) => {
  const { amount, description } = req.body;
  const id = crypto.randomUUID();

  const parsed = transactionSchema.safeParse({ id, amount, description });

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors });
  }
  data.push(parsed.data);
  res.status(201).json({
    message: "Transaction created",
    transaction: parsed.data,
  });
});

router.get("/transactions", (req, res) => {
  return res.status(200).json({ transactions: data });
});

router.get("/transaction/:id", (req, res) => {
  const { id } = req.params;
  const transaction = data.find((t) => t.id === id);
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  return res.status(200).json({ transaction });
});

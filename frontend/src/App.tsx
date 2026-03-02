import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useEffect, useState } from "react";
import { api } from "./service/axios";

const formSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
});

type FormData = z.infer<typeof formSchema>;

export type Transaction = FormData & { id: string };

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(formData: FormData) {
    try {
      setError(null);
      const response = await api.post("/api/transactions", formData);
      setTransactions((prev) => [...prev, response.data]);
      reset();
    } catch (err) {
      setError("Failed to create transaction. Please try again.");
      console.error("Error creating transaction:", err);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/transactions");
        if (Array.isArray(response.data)) {
          setTransactions(response.data);
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm h-16">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4 max-w-lg mx-auto"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            New Transaction
          </h2>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded p-2">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <input
              id="description"
              placeholder="e.g. Grocery shopping"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : "Add Transaction"}
          </button>
        </form>

        {/* Transaction List */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 max-w-lg mx-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Transaction History
          </h2>

          {transactions.length === 0 ? (
            <p className="text-sm text-gray-500">No transactions yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {transactions.map((t) => (
                <li key={t.id} className="flex justify-between py-3">
                  <span className="text-gray-700">{t.description}</span>
                  <span className="font-medium text-gray-900">
                    ${t.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useEffect, useState } from "react";
import { api } from "./service/axios";

const transactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  description: z.string().min(1, "Description is required"),
});

export type Transaction = z.infer<typeof transactionSchema>;

function App() {
  const [data, setData] = useState<Transaction[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Transaction>({
    resolver: zodResolver(transactionSchema),
  });

  async function onSubmit(data: Transaction) {
    try {
      const response = await api.post("/api/transactions", data);
      console.log("Transaction created:", response.data);
      setData((prevData) => [...prevData, response.data]);
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/transactions");
        const data = response.data;
        console.log("Fetched transactions:", data);
        if (data && data.length > 0) {
          setData(data);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 h-full">
      <header className="bg-white shadow-sm h-16">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">App</h1>
        </div>
      </header>
      <div className="h-[calc(100vh-4rem)] w-full justify-center flex p-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="border-2 border-gray-600 rounded p-4 space-y-2 h-40 w-96"
        >
          <div>
            <label htmlFor="amount">Amount: </label>
            <input id="amount" type="number" {...register("amount")} />
            {errors.amount && (
              <p className="text-red-500">{errors.amount.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="description">Description: </label>
            <input id="description" {...register("description")} />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </form>
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold">Transactions</h2>
        <ul className="list-disc pl-5">
          {data?.map((transaction) => (
            <li key={transaction.id}>
              {transaction.description}: ${transaction.amount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

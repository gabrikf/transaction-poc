import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./routes/index.js";

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

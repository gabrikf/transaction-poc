import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../index.js";
import { data } from "./index.js";

beforeEach(() => {
  data.length = 0;
});

describe("Transactions API", () => {
  it("POST /api/transactions — creates a transaction", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .send({ amount: 42.5, description: "Test purchase" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      amount: 42.5,
      description: "Test purchase",
    });
    expect(res.body.id).toBeDefined();
  });

  it("POST /api/transactions — rejects invalid input", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .send({ amount: -10, description: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("GET /api/transactions — returns saved transactions", async () => {
    await request(app)
      .post("/api/transactions")
      .send({ amount: 10, description: "First" });

    await request(app)
      .post("/api/transactions")
      .send({ amount: 20, description: "Second" });

    const res = await request(app).get("/api/transactions");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].description).toBe("First");
    expect(res.body[1].description).toBe("Second");
  });

  it("GET /api/transactions/:id — returns a single transaction", async () => {
    const created = await request(app)
      .post("/api/transactions")
      .send({ amount: 99, description: "Find me" });

    const res = await request(app).get(`/api/transactions/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.description).toBe("Find me");
  });

  it("GET /api/transactions/:id — 404 for unknown id", async () => {
    const res = await request(app).get(
      "/api/transactions/00000000-0000-0000-0000-000000000000",
    );

    expect(res.status).toBe(404);
  });
});

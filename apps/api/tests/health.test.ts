import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/server";

describe("GET /health", () => {
  it("should return 200 and status OK", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);

    const resBody = response.body;
    expect(resBody).toMatchObject({
      status: "OK",
      uptime: expect.any(Number),
    });
  });

  it("should return json content", async () => {
    const response = await request(app).get("/health");

    expect(response.headers["content-type"]).toContain("application/json");
  });
});

const request = require("supertest");
const app = require("../app");

describe("GET /health", () => {
  test("should return status ok and uptime", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.uptime).toBe("number");
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });
});

describe("GET /stats", () => {
  test("should return stats payload with expected fields", async () => {
    const res = await request(app).get("/stats");

    expect(res.statusCode).toBe(200);
    expect(typeof res.body.totalProducts).toBe("number");
    expect(typeof res.body.instanceId).toBe("string");
    expect(typeof res.body.serverTime).toBe("string");
    expect(typeof res.body.uptime).toBe("number");
    expect(typeof res.body.requestCount).toBe("number");
  });

  test("should return valid ISO date in serverTime", async () => {
    const res = await request(app).get("/stats");

    expect(res.statusCode).toBe(200);
    expect(new Date(res.body.serverTime).toString()).not.toBe("Invalid Date");
  });
});
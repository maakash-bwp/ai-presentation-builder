const request = require("supertest");
const app = require("../src/app");

describe("app routes", () => {
  test("GET /api/health returns healthy status", async () => {
    const response = await request(app).get("/api/health");
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("unknown route returns 404", async () => {
    const response = await request(app).get("/api/unknown");
    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});

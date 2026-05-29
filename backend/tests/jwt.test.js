const { signToken, verifyToken } = require("../src/utils/jwt");

describe("jwt utils", () => {
  test("signToken and verifyToken work together", () => {
    const token = signToken({ userId: "abc123" });
    const payload = verifyToken(token);
    expect(payload.userId).toBe("abc123");
  });
});

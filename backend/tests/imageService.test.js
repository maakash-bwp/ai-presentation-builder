describe("imageService", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.UNSPLASH_ACCESS_KEY;
    delete process.env.IMAGE_PROVIDER;
  });

  test("returns a real stock/ai image URL when provider is default and unsplash key is missing", async () => {
    jest.doMock("axios", () => ({
      create: jest.fn(() => ({
        get: jest.fn()
      }))
    }));

    const { generateImage } = require("../src/ai/imageService");
    const result = await generateImage("ai healthcare");
    expect(result.imageUrl).toMatch(/^(https:\/\/|data:image\/svg\+xml)/);
    expect(result.provider).toBeTruthy();
    expect(result.prompt).toBeTruthy();
    expect(result.generatedAt).toBeTruthy();
  });

  test("returns unsplash image when available", async () => {
    process.env.UNSPLASH_ACCESS_KEY = "test_key";
    process.env.IMAGE_PROVIDER = "unsplash";
    const getMock = jest.fn().mockResolvedValue({
      data: {
        results: [{ urls: { regular: "https://images.unsplash.com/photo-123" } }]
      }
    });

    jest.doMock("axios", () => ({
      create: jest.fn(() => ({
        get: getMock
      }))
    }));

    const { generateImage } = require("../src/ai/imageService");
    const result = await generateImage("tech");
    expect(result.imageUrl).toMatch(/^https:\/\/images\.unsplash\.com\/photo-123/);
    expect(result.provider).toBe("unsplash");
    expect(getMock).toHaveBeenCalledTimes(1);
  });
});

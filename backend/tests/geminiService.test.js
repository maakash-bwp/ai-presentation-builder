describe("geminiService", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  test("generateOutline returns parsed headings", async () => {
    process.env.GEMINI_API_KEY = "test-key";

    const postMock = jest.fn().mockResolvedValue({
      data: {
        candidates: [
          {
            content: {
              parts: [{ text: '["Intro","Use Cases","Future"]' }]
            }
          }
        ]
      }
    });

    jest.doMock("axios", () => ({
      create: jest.fn(() => ({ post: postMock }))
    }));

    const { generateOutline } = require("../src/ai/geminiService");
    const result = await generateOutline("AI in Healthcare", 3);

    expect(result).toEqual(["Intro", "Use Cases", "Future"]);
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  test("generateSlides returns ordered slides", async () => {
    process.env.GEMINI_API_KEY = "test-key";

    const postMock = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      title: "Slide 1",
                      bulletPoints: ["A", "B", "C", "D"],
                      summary: "Summary 1"
                    })
                  }
                ]
              }
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      title: "Slide 2",
                      bulletPoints: ["E", "F", "G", "H"],
                      summary: "Summary 2"
                    })
                  }
                ]
              }
            }
          ]
        }
      });

    jest.doMock("axios", () => ({
      create: jest.fn(() => ({ post: postMock }))
    }));

    const { generateSlides } = require("../src/ai/geminiService");
    const result = await generateSlides({
      topic: "AI",
      outline: ["Slide 1", "Slide 2"]
    });

    expect(result).toHaveLength(2);
    expect(result[0].order).toBe(1);
    expect(result[1].order).toBe(2);
  });
});

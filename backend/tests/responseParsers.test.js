const {
  parseOutline,
  parseSlideContent
} = require("../src/utils/responseParsers");

describe("response parsers", () => {
  test("parseOutline parses JSON array and enforces length", () => {
    const raw = JSON.stringify(["Intro", "Market", "Strategy"]);
    const result = parseOutline(raw, 2);
    expect(result).toEqual(["Intro", "Market"]);
  });

  test("parseOutline fills missing slides", () => {
    const result = parseOutline("- One", 3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe("One");
  });

  test("parseSlideContent parses strict JSON object", () => {
    const raw = JSON.stringify({
      title: "AI in Imaging",
      bulletPoints: ["Point 1", "Point 2", "Point 3", "Point 4"],
      summary: "AI improves diagnosis speed."
    });

    const result = parseSlideContent(raw, "Fallback");
    expect(result.title).toBe("AI in Imaging");
    expect(result.bulletPoints).toHaveLength(4);
    expect(result.summary).toBe("AI improves diagnosis speed.");
  });

  test("parseSlideContent falls back to default structure", () => {
    const result = parseSlideContent("Not JSON", "Fallback");
    expect(result.title).toBe("Fallback");
    expect(result.bulletPoints.length).toBeGreaterThan(0);
  });
});

require('dotenv').config();
const axios = require('axios');

const buildStockQuery = (query) => {
  const sanitizeWords = (value) =>
    String(value || "")
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const stopWords = new Set(["the", "and", "for", "with", "slide", "presentation", "overview", "introduction", "conclusion"]);
  
  const normalized = sanitizeWords(query);
  
  const tokens = normalized
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => word.length > 2)
    .filter((word) => !stopWords.has(word.toLowerCase()))
    .slice(0, 3) // Max 3 words for stock photos
    .join(" ");

  return tokens || "business meeting";
};

async function testPexels() {
  const queries = [
    "Best Practices DSA"
  ];
  
  for (const originalQuery of queries) {
    const searchQuery = buildStockQuery(originalQuery);
    console.log(`Original: "${originalQuery}" => Search: "${searchQuery}"`);

    try {
      const { data } = await axios.get("https://api.pexels.com/v1/search", {
        params: {
          query: searchQuery,
          orientation: "landscape",
          per_page: 3
        },
        headers: {
          Authorization: process.env.PEXELS_API_KEY
        }
      });
      console.log(`  Found photos: ${data.photos.length}`);
      if (data.photos.length > 0) {
        console.log(`  Preview: ${data.photos[0].src.landscape}`);
      }
    } catch (error) {
      console.error("  Error:", error.message);
    }
    console.log("---");
  }
}

testPexels();

require('dotenv').config();
const { generateImage } = require('./src/ai/imageService');

async function test() {
  console.log("Testing generateImage...");
  try {
    const result = await generateImage("Best Practices For DSA Interview Preparation");
    console.log("Result:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();

require('dotenv').config();
const axios = require('axios');

async function testGroq() {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say hello' }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("Success:", response.data.choices[0].message.content);
  } catch (error) {
    console.error("Error:");
    if (error.response) {
      console.error(error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testGroq();

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const HF_API_URL = "https://api-inference.huggingface.co/models/gpt2";
const HF_API_TOKEN = process.env.HF_API_TOKEN;

app.post('/generate-description', async (req, res) => {
  const product = req.body.product;

  try {
    const response = await axios.post(
      HF_API_URL,
      { inputs: `Describe the food product: ${product}` },
      { headers: { Authorization: `Bearer ${HF_API_TOKEN}` } }
    );

    const description = response.data[0]?.generated_text || "No description generated.";
    res.json({ description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

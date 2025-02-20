import type { NextApiRequest, NextApiResponse } from 'next'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { productName } = req.query

  if (!productName || typeof productName !== 'string') {
    return res.status(400).json({ error: 'Product name is required' })
  }

  try {
    // Check cache first
    const cachedData = await redis.get(productName.toLowerCase())
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData))
    }

    // If not cached, call OpenAI
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('API key is missing')
    }

    const prompt = `Write a concise 2-line description of the product '${productName}', including its history, the company that manufactures it, and its main purpose. Then, provide a short, bullet-point summary of any known health concerns associated with this product.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch response')
    }

    const data = await response.json()
    const responseText = data.choices[0]?.message?.content || 'No response received'
    const [desc, health] = responseText.split('\n\n')

    const result = {
      description: desc || 'No description available.',
      healthConcerns: health || 'No health concerns mentioned.',
    }

    // Cache result for 24 hours
    await redis.set(
      productName.toLowerCase(),
      JSON.stringify(result),
      'EX',
      86400 // 24 hours in seconds
    )

    res.status(200).json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' })
  }
}
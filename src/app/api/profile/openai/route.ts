import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Parse JSON body once

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // OpenAI prompt
    const prompt = `Based on the following health profile, provide:
    1. A list of 5-10 recommended foods/nutrients with brief explanations
    2. A list of 5-10 foods/substances to avoid with brief explanations
    
    Health Profile:
    ${JSON.stringify(body, null, 2)}
    
    **Return the response strictly in JSON format. Do not include any extra text.**  
    Example:  
    {"recommendations":["Salmon - Rich in omega-3 for heart health"],"warnings":["Grapefruit - Can interact with certain medications"]}`;

    // Fetch API Key securely
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OpenAI API key" },
        { status: 500 }
      );
    }

    // OpenAI API request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      return NextResponse.json(
        {
          recommendations: ["Error processing recommendations."],
          warnings: ["Error processing warnings."],
        },
        { status: 500 }
      );
    }

    let content = data.choices[0].message.content.trim();

    try {
      const result = JSON.parse(content);
      return NextResponse.json(result);
    } catch (error) {
      console.error("OpenAI response is not valid JSON:", content);
      return NextResponse.json(
        {
          recommendations: ["OpenAI response was not in JSON format."],
          warnings: ["Try again with a refined request."],
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      {
        recommendations: ["Error generating recommendations. Please try again later."],
        warnings: ["Error generating warnings. Please try again later."],
      },
      { status: 500 }
    );
  }
}
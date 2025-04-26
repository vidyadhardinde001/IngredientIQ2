import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const requestId = Date.now(); // Unique identifier for each request

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty request body" },
        { status: 400 }
      );
    }

    // Create a detailed signature of the input data
    const inputSignature = {
      demographics: {
        age: body.age,
        gender: body.gender,
        bmi: body.weight && body.height ? 
          (body.weight / ((body.height/100) ** 2)).toFixed(1) : null
      },
      medical: {
        conditions: body.conditions?.length || 0,
        medications: body.medications?.length || 0,
        allergies: body.allergies?.length || 0
      },
      lifestyle: {
        activity: body.activityLevel,
        preferences: body.dietaryPreferences?.length || 0,
        goals: body.goals?.length || 0
      }
    };

    const prompt = `
    # COMPREHENSIVE NUTRITION ANALYSIS REQUEST
    ## Request ID: ${requestId}
    ## Input Signature: ${JSON.stringify(inputSignature)}
    
    PATIENT PROFILE:
    ${Object.entries(body)
      .map(([key, val]) => `- ${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
      .join('\n')}
    
    REQUIREMENTS:
    1. Generate 8-12 UNIQUE food recommendations with:
       - Scientific rationale (cite mechanisms)
       - Serving specifics
       - Profile relevance
       - Preparation tips
    
    2. Identify 8-12 RESTRICTIONS with:
       - Detailed risk analysis
       - Specific alternatives
       - Interaction warnings
    
    3. Provide COMPREHENSIVE GUIDANCE:
       - Meal timing strategy
       - Supplement suggestions
       - Lifestyle synergies
       - Monitoring advice
    
    RESPONSE FORMAT (STRICT JSON):
    {
      "meta": {
        "requestId": "${requestId}",
        "analysisDate": "${new Date().toISOString()}"
      },
      "recommendations": [
        {
          "item": "Food name",
          "rationale": "Detailed explanation...",
          "serving": "Specific guidance...",
          "relevance": "Profile-specific benefits...",
          "tips": "Preparation/consumption advice..."
        }
      ],
      "restrictions": [
        {
          "item": "Food name",
          "risks": "Detailed analysis...",
          "alternatives": "Suggested substitutes...",
          "interactions": "Any medication interactions..."
        }
      ],
      "comprehensive_plan": {
        "meal_timing": "Detailed strategy...",
        "supplements": ["Supplement 1 with dosage", ...],
        "lifestyle": ["Activity 1", ...],
        "monitoring": ["Metric 1 to track", ...]
      }
    }

    IMPORTANT:
    - Vary responses significantly based on input signature
    - Include at least 3 unique elements per recommendation
    - Never duplicate previous responses
    - Current timestamp: ${Date.now()}`;

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OpenAI API key" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-1106", // Use the newest 3.5 model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9, // Higher for more variability
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0.7, // Strongly discourage repetition
        presence_penalty: 0.7, // Encourage new concepts
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      console.error("API Error:", data);
      return NextResponse.json(
        { error: "API request failed", details: data },
        { status: 500 }
      );
    }

    const content = data.choices[0].message.content;

    // Robust JSON parsing
    try {
      const result = JSON.parse(content);
      return NextResponse.json(result);
    } catch (e) {
      // Fallback parsing attempt
      try {
        const cleanContent = content.replace(/```json|```/g, '');
        const result = JSON.parse(cleanContent);
        return NextResponse.json(result);
      } catch (e2) {
        console.error("JSON Parse Error:", e2, "Content:", content);
        return NextResponse.json(
          { error: "Response format error", raw: content },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
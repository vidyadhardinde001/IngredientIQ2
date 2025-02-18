"use client";
import React, { useState } from "react";

const HealthInfo: React.FC = () => {
  const [productName, setProductName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [healthConcerns, setHealthConcerns] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchProductInfo = async () => {
    setLoading(true);
    setError("");
    setDescription("");
    setHealthConcerns("");

    try {
      if (!productName.trim()) {
        setError("Please enter a product name.");
        setLoading(false);
        return;
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("API key is missing! Add it to .env.local");
      }

      const prompt = `Write a concise 2-line description of the product '${productName}', including its history, the company that manufactures it, and its main purpose. Then, provide a short, bullet-point summary of any known health concerns associated with this product.`;

      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
      };

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await res.json();
      const responseText = data.choices[0]?.message?.content || "No response received";

      // Split description & health concerns (assuming OpenAI returns them in separate paragraphs)
      const [desc, health] = responseText.split("\n\n");
      setDescription(desc || "No description available.");
      setHealthConcerns(health || "No health concerns mentioned.");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Product Information</h1>

      <input
        type="text"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="Enter product name..."
        className="border px-4 py-2 rounded-md mb-4 w-full max-w-md"
      />

      <button
        onClick={fetchProductInfo}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        disabled={loading}
      >
        {loading ? "Fetching..." : "Get Product Info"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {description && (
        <div className="mt-6 p-4 bg-white shadow-md rounded-md w-full max-w-lg">
          <h2 className="text-lg font-semibold">Description:</h2>
          <p className="text-gray-700">{description}</p>
        </div>
      )}

      {healthConcerns && (
        <div className="mt-4 p-4 bg-white shadow-md rounded-md w-full max-w-lg">
          <h2 className="text-lg font-semibold">Health Concerns:</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{healthConcerns}</p>
        </div>
      )}
    </div>
  );
};

export default HealthInfo;

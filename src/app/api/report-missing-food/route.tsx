"use client"; // Mark the file as a client-side component

import { useState } from "react";
import { FaUtensils, FaPaperPlane } from "react-icons/fa";

export default function ReportMissingFood() {
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [packagingType, setPackagingType] = useState("");
  const [ingredients, setIngredients] = useState(""); // Comma-separated list
  const [description, setDescription] = useState("");
  const [aiInfo, setAiInfo] = useState<string | null>(null); // AI response state
  const [aiImage, setAiImage] = useState<string | null>(null); // AI Image state
  const [aiRating, setAiRating] = useState<number | null>(null); // AI Rating state
  const [ageRangeRatings, setAgeRangeRatings] = useState<{ [key: string]: number | null }>({}); // Age range ratings state
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch AI information for the food name entered
  const fetchAIInfo = async () => {
    try {
      const response = await fetch("/api/report-missing-food/ai-food-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ foodName }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI information");
      }

      const data = await response.json();
      if (data?.info) {
        setAiInfo(data.info);  // Set AI info to display
        setAiImage(data.image || null);  // Set AI image
        setAiRating(data.rating || null);  // Set AI rating

        // Set age range ratings, if available
        if (data.ageRangeRatings) {
          setAgeRangeRatings(data.ageRangeRatings);
        }
      } else {
        setError("No relevant information found.");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError("Failed to fetch AI information.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError("");

    if (!foodName.trim()) {
      setError("Please enter a food name");
      setIsSubmitting(false);
      return;
    }

    await fetchAIInfo(); // Fetch AI info on form submit

    // Your submission logic here for the rest of the form (submit food info)
    // Example: Save the data to the database or handle another action.

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold text-teal-700 flex items-center mb-6">
        <FaUtensils className="mr-2" /> Report Missing Food
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="foodName" className="block text-sm font-medium text-gray-700">
            Food Name
          </label>
          <input
            type="text"
            id="foodName"
            name="foodName"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter the name of the food"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter the food category"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
            Brand
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter the food brand"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="packagingType" className="block text-sm font-medium text-gray-700">
            Packaging Type
          </label>
          <input
            type="text"
            id="packagingType"
            name="packagingType"
            value={packagingType}
            onChange={(e) => setPackagingType(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter packaging type"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
            Ingredients (Comma-separated)
          </label>
          <input
            type="text"
            id="ingredients"
            name="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter ingredients"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter additional details"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-teal-600 text-white rounded-lg flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : <><FaPaperPlane className="mr-2" /> Submit Food</>}
        </button>
      </form>

      {aiInfo && (
        <div className="mt-6 p-4 bg-teal-100 text-teal-700 rounded-lg">
          <h2 className="font-bold text-xl">AI Information:</h2>
          <p>{aiInfo}</p>

          {aiImage && (
            <div className="mt-4">
              <h3 className="font-semibold">Food Image:</h3>
              <img src={aiImage} alt="Food" className="w-full mt-2 rounded-md" />
            </div>
          )}

          {aiRating !== null && (
            <div className="mt-4">
              <h3 className="font-semibold">Rating:</h3>
              <p>{aiRating} / 5</p>
            </div>
          )}

          {Object.keys(ageRangeRatings).length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold">Age Range Ratings:</h3>
              <ul className="list-disc pl-5">
                {Object.entries(ageRangeRatings).map(([ageRange, rating]) => (
                  <li key={ageRange}>
                    <strong>{ageRange}:</strong> {rating ?? "Not Rated"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
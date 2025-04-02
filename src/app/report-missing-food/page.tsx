"use client";
import { useState } from "react";
import { FaUtensils, FaPaperPlane, FaCheckCircle } from "react-icons/fa";

export default function ReportMissingFood() {
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [packagingType, setPackagingType] = useState("");
  const [ingredients, setIngredients] = useState(""); // Comma-separated list
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foodName.trim()) {
      setError("Please enter a food name");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/report-missing-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foodName,
          category,
          brand,
          packagingType,
          ingredients: ingredients.split(",").map((i) => i.trim()), // Convert to array
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit food");
      }

      setIsSuccess(true);
      setFoodName("");
      setCategory("");
      setBrand("");
      setPackagingType("");
      setIngredients("");
      setDescription("");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold text-teal-700 flex items-center mb-6">
        <FaUtensils className="mr-2" /> Report Missing Food
      </h1>
      
      {isSuccess ? (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg mb-4 flex items-center">
          <FaCheckCircle className="mr-2" />
          Thank you! Your submission has been received.
        </div>
      ) : (
        <>
          <p className="mb-4 text-gray-600">
            Help us improve our recommendations by letting us know about foods that
            aren't currently in our database.
          </p>
          
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="foodName">Food Name *</label>
              <input type="text" id="foodName" value={foodName} onChange={(e) => setFoodName(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="e.g., Dragon fruit" />
            </div>

            <div className="mb-4">
              <label htmlFor="category">Category</label>
              <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="e.g., Fruit" />
            </div>

            <div className="mb-4">
              <label htmlFor="brand">Brand</label>
              <input type="text" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="e.g., Organic Fresh" />
            </div>

            <div className="mb-4">
              <label htmlFor="packagingType">Packaging Type</label>
              <input type="text" id="packagingType" value={packagingType} onChange={(e) => setPackagingType(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="e.g., Bottle" />
            </div>

            <div className="mb-4">
              <label htmlFor="ingredients">Ingredients (comma-separated)</label>
              <input type="text" id="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="e.g., Sugar, Milk, Cocoa" />
            </div>

            <div className="mb-4">
              <label htmlFor="description">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Optional details"></textarea>
            </div>

            <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-lg flex items-center justify-center" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : <><FaPaperPlane className="mr-2" /> Submit Food</>}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

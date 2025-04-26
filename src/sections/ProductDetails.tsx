"use client";
import React, { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";

interface Product {
  id: string;
  code?: string;
  image_url?: string;
  product_name?: string;
  countries_tags?: string[];
  categories?: string;
  ecoscore_data?: {
    threatening_ingredients?: string[];
  };
  allergens_tags?: string[];
  packaging_tags?: string[];
  ingredients_text?: string;
}

interface AgeGroupRating {
  ageGroup: string;
  rating: number;
}

interface Props {
  selectedProduct: Product;
}

const ProductDetails: React.FC<Props> = ({ selectedProduct }) => {
  const [healthRatings, setHealthRatings] = useState<AgeGroupRating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [ratingError, setRatingError] = useState("");

  const COUNTRY_MAP: { [key: string]: string } = {
    "germany": "Germany",
    "france": "France",
    "italy": "Italy",
    "spain": "Spain",
    "united-kingdom": "UK",
    "united-states": "USA",
  };

  const CATEGORY_TRANSLATIONS: { [key: string]: string } = {
    "frühstücke": "Breakfast Foods",
    "getränke": "Beverages",
    "snacks": "Snacks",
    "milchprodukte": "Dairy Products",
    "backwaren": "Bakery Items",
    "fertiggerichte": "Prepared Meals",
  };

  const AGE_GROUPS = [
    "Children (3-12)",
    "Teenagers (13-19)",
    "Adults (20-64)",
    "Elderly (65+)"
  ];

  useEffect(() => {
    if (selectedProduct.product_name) {
      fetchHealthRatings();
    }
  }, [selectedProduct]);

  const fetchHealthRatings = async () => {
    setLoadingRatings(true);
    setRatingError("");

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OpenAI API key not configured");
      }

      const prompt = `Provide health ratings (1-10) for "${selectedProduct.product_name}" for these age groups: 
      Children (3-12), Teenagers (13-19), Adults (20-64), Elderly (65+). 
      Return only a JSON array like: [1,2,3,2]`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);

      // Handle different possible response formats
      let ratingsArray = [];
      if (Array.isArray(content)) {
        ratingsArray = content;
      } else if (content.ratings) {
        ratingsArray = content.ratings;
      } else if (typeof content === 'object') {
        ratingsArray = Object.values(content);
      }

      // Create age group rating objects
      const ratings = AGE_GROUPS.map((ageGroup, index) => ({
        ageGroup,
        rating: ratingsArray[index] || 5 // Default to 5 if no rating
      }));

      setHealthRatings(ratings);
    } catch (error) {
      console.error("Error fetching health ratings:", error);
      setRatingError("Failed to load health ratings. Showing sample data.");
      setHealthRatings(AGE_GROUPS.map(ageGroup => ({
        ageGroup,
        rating: Math.floor(Math.random() * 5) + 5 // Random rating between 5-10
      })));
    } finally {
      setLoadingRatings(false);
    }
  };

  const getCountries = () => {
    if (!selectedProduct.countries_tags?.length) return "No country data";
    return selectedProduct.countries_tags
      .map(country => {
        const parts = country.split(':');
        const countryKey = parts.length > 1 ? parts[1].toLowerCase() : country.toLowerCase();
        return COUNTRY_MAP[countryKey] || countryKey.charAt(0).toUpperCase() + countryKey.slice(1);
      })
      .join(", ");
  };

  const getCategory = () => {
    if (!selectedProduct.categories) return "Category not specified";
    const baseCategory = selectedProduct.categories
      .split(',')
      .shift()
      ?.trim()
      .toLowerCase();
    return CATEGORY_TRANSLATIONS[baseCategory || ''] ||
      baseCategory?.replace(/_/g, " ")
        .replace(/(^\w|\s\w)/g, m => m.toUpperCase()) ||
      "N/A";
  };

  const getAllergens = () => {
    if (!selectedProduct.allergens_tags?.length) return "No listed allergens";
    return selectedProduct.allergens_tags
      .map(allergen => allergen
        .replace(/^en:/, '')
        .replace(/-/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '))
      .join(", ");
  };

  const getPackaging = () => {
    if (!selectedProduct.packaging_tags?.length) return "Packaging info not available";
    return selectedProduct.packaging_tags
      .map(p => p.split(':').pop() || p)
      .join(", ")
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getThreatenedSpecies = () => {
    if (!selectedProduct.ecoscore_data?.threatening_ingredients?.length) {
      return "No threatened species impact detected";
    }
    return selectedProduct.ecoscore_data.threatening_ingredients
      .join(", ")
      .replace(/_/g, " ")
      .replace(/(^\w|\s\w)/g, m => m.toUpperCase());
  };

  const addToCart = () => {
    const cart: Product[] = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!cart.some(item => item.id === selectedProduct.id)) {
      const updatedCart = [...cart, selectedProduct];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("storage"));
      alert(`${selectedProduct.product_name || "Product"} added to cart!`);
    } else {
      alert("This product is already in your cart");
    }
  };

  const renderHealthRating = (rating: number) => {
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(10 - Math.floor(rating));
    const colorClass = rating >= 8 ? 'text-green-400' :
      rating >= 5 ? 'text-yellow-400' : 'text-red-400';

    return (
      <div className="flex items-center">
        <span className={`${colorClass} mr-2`}>{stars}</span>
        <span className="text-sm text-white">({rating}/10)</span>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 h-full p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="flex-1 bg-gray-800 rounded-lg">
            {selectedProduct.image_url ? (
              <img
                src={selectedProduct.image_url}
                alt="Product"
                className="w-full h-full object-contain rounded-lg bg-white"
              />
            ) : (
              <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No Image Available</p>
              </div>
            )}
          </div>

          <button
            onClick={addToCart}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <FaShoppingCart />
            Add to Cart
          </button>
        </div>

        <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Product Name:
            </label>
            <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
              {selectedProduct.product_name || "Not specified"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Countries:
            </label>
            <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
              {getCountries()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Category:
            </label>
            <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
              {getCategory()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Threatened Species:
            </label>
            <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
              {getThreatenedSpecies()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Allergens:
            </label>
            <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
              {getAllergens()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Packaging:
            </label>
            <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
              {getPackaging()}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3">Health Ratings</h3>

              {loadingRatings ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : ratingError ? (
                <div className="text-yellow-400 mb-4">{ratingError}</div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {healthRatings.map((rating) => {
                  // Determine color based on rating
                  let bgColor = '';
                  let textColor = '';

                  if (rating.rating >= 8) {
                    bgColor = 'bg-green-900/30';
                    textColor = 'text-green-400';
                  } else if (rating.rating >= 6) {
                    bgColor = 'bg-yellow-900/30';
                    textColor = 'text-yellow-400';
                  } else {
                    bgColor = 'bg-red-900/30';
                    textColor = 'text-red-400';
                  }

                  // Get icon for age group
                  const getAgeIcon = () => {
                    switch (rating.ageGroup) {
                      case 'Children (3-12)':
                        return '👶';
                      case 'Teenagers (13-19)':
                        return '🧑‍🎓';
                      case 'Adults (20-64)':
                        return '🧑‍💼';
                      case 'Elderly (65+)':
                        return '🧓';
                      default:
                        return '👤';
                    }
                  };

                  return (
                    <div key={rating.ageGroup} className={`${bgColor} p-4 rounded-lg flex flex-col items-center`}>
                      <span className="text-3xl mb-2">{getAgeIcon()}</span>
                      <span className={`${textColor} text-4xl font-bold`}>{rating.rating}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
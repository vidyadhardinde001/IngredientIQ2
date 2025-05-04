"use client";
import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaInfoCircle, FaLeaf, FaGlobe, FaTag, FaAllergies, FaBoxOpen } from "react-icons/fa";
import { GiHealthNormal } from "react-icons/gi";

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
      Children (3-12), Adults (20+). 
      Return only a JSON array like: [1,2]`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
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

      let ratingsArray: number[] = [];

      if (Array.isArray(content)) {
        ratingsArray = content;
      } else if (content.ratings) {
        ratingsArray = content.ratings;
      } else if (typeof content === 'object') {
        ratingsArray = Object.values(content);
      }

      const ratings = AGE_GROUPS.map((ageGroup, index) => ({
        ageGroup,
        rating: ratingsArray[index] || 5
      }));

      setHealthRatings(ratings);
    } catch (error) {
      console.error("Error fetching health ratings:", error);
      setRatingError("Failed to load health ratings. Showing sample data.");
      setHealthRatings(AGE_GROUPS.map(ageGroup => ({
        ageGroup,
        rating: Math.floor(Math.random() * 5) + 5
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
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Image Section */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700">
              {selectedProduct.image_url ? (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.product_name || "Product"}
                  className="w-full h-96 object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">No Image Available</p>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={addToCart}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/20"
                >
                  <FaShoppingCart className="text-lg" />
                  <span className="font-medium">Add to Cart</span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700">
              <h1 className="text-3xl font-bold text-white mb-2">
                {selectedProduct.product_name || "Unnamed Product"}
              </h1>

              {selectedProduct.code && (
                <p className="text-gray-400 mb-6">Product Code: {selectedProduct.code}</p>
              )}

              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaGlobe className="text-blue-400" />
                    <h3 className="font-medium text-white">Origin</h3>
                  </div>
                  <p className="text-gray-300">{getCountries()}</p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTag className="text-purple-400" />
                    <h3 className="font-medium text-white">Category</h3>
                  </div>
                  <p className="text-gray-300">{getCategory()}</p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaAllergies className="text-red-400" />
                    <h3 className="font-medium text-white">Allergens</h3>
                  </div>
                  <p className="text-gray-300">{getAllergens()}</p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaBoxOpen className="text-yellow-400" />
                    <h3 className="font-medium text-white">Packaging</h3>
                  </div>
                  <p className="text-gray-300">{getPackaging()}</p>
                </div>
              </div>

              {/* Sustainability Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <FaLeaf className="text-green-400 text-xl" />
                  <h2 className="text-xl font-semibold text-white">Sustainability</h2>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300">{getThreatenedSpecies()}</p>
                </div>
              </div>

              {/* Health Ratings Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <GiHealthNormal className="text-blue-400 text-xl" />
                  <h2 className="text-xl font-semibold text-white">Health Ratings</h2>
                </div>

                {loadingRatings ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : ratingError ? (
                  <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <FaInfoCircle />
                      <span>{ratingError}</span>
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-4">
                  {healthRatings
                    .filter(rating =>
                      rating.ageGroup === 'Children (3-12)' ||
                      rating.ageGroup === 'Adults (20-64)'
                    )
                    .map((rating) => {
                      // Determine color based on rating
                      let bgColor = '';
                      let textColor = '';
                      let borderColor = '';

                      if (rating.rating >= 8) {
                        bgColor = 'bg-green-900/20';
                        textColor = 'text-green-400';
                        borderColor = 'border-green-800';
                      } else if (rating.rating >= 6) {
                        bgColor = 'bg-yellow-900/20';
                        textColor = 'text-yellow-400';
                        borderColor = 'border-yellow-800';
                      } else {
                        bgColor = 'bg-red-900/20';
                        textColor = 'text-red-400';
                        borderColor = 'border-red-800';
                      }

                      // Get icon for age group
                      const getAgeIcon = () => {
                        switch (rating.ageGroup) {
                          case 'Adults (20-64)':
                            return '🧑‍💼';
                          case 'Children (3-12)':
                            return '👶';
                          default:
                            return '👤';
                        }
                      };

                      return (
                        <div
                          key={rating.ageGroup}
                          className={`${bgColor} ${borderColor} border p-4 rounded-xl flex flex-col items-center transition-all hover:scale-105`}
                        >
                          <span className="text-4xl mb-2">{getAgeIcon()}</span>
                          <span className="text-sm text-gray-300 mb-1 text-center">{rating.ageGroup}</span>
                          <div className="flex items-center justify-center">
                            <span className={`${textColor} text-4xl font-bold`}>{rating.rating}</span>
                            <span className="text-gray-400 text-lg ml-1">/10</span>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
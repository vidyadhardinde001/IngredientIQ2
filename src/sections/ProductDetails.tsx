// sections/ProductDetails.tsx

"use client";
import React from "react";
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
}

interface Props {
  selectedProduct: Product;
}

const ProductDetails: React.FC<Props> = ({ selectedProduct }) => {
  const COUNTRY_MAP: { [key: string]: string } = {
    "germany": "Germany",
    "france": "France",
    "italy": "Italy",
  };

  const CATEGORY_TRANSLATIONS: { [key: string]: string } = {
    "frühstücke": "Breakfast Foods",
    "getränke": "Beverages",
    "snacks": "Snacks",
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
              <p className="text-gray-500">No Image</p>
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
            <label className="block text-sm font-medium text-white">
              Name of Product:
            </label>
            <textarea
              readOnly
              value={selectedProduct.product_name || "Product Name"}
              className="w-full min-h-[50px] p-2 border rounded-md bg-gray-50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Countries Sold In:
            </label>
            <textarea
              readOnly
              value={getCountries()}
              className="w-full min-h-[50px] p-2 border rounded-md bg-gray-50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Category:
            </label>
            <textarea
              readOnly
              value={getCategory()}
              className="w-full min-h-[50px] p-2 border rounded-md bg-gray-50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Threatened Species:
            </label>
            <textarea
              readOnly
              value={getThreatenedSpecies()}
              className="w-full min-h-[50px] p-2 border rounded-md bg-gray-50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Allergens:
            </label>
            <textarea
              readOnly
              value={getAllergens()}
              className="w-full min-h-[50px] p-2 border rounded-md bg-gray-50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Packaging:
            </label>
            <textarea
              readOnly
              value={getPackaging()}
              className="w-full min-h-[50px] p-2 border rounded-md bg-gray-50 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
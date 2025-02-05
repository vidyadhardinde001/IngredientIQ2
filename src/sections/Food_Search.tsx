"use client";

import React, { useState } from "react";
import axios from "axios";
import SearchInput from "./SearchInput";
import ProductList from "./ProductList";
import ProductDetails from "./ProductDetails";
import NutritionalBreakdown from "./NutritionalBreakdown";
import DetailedInfo from "./DetailedInfo";
import NutritionalChart from "./NutritionalChart";

const FoodSearch: React.FC = () => {
  const [barcode, setBarcode] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [foodDataList, setFoodDataList] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFoodByBarcode = async () => {
    setLoading(true);
    setSelectedProduct(null);
    setError("");
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      if (response.data.status === 1 && response.data.product) {
        setSelectedProduct(response.data.product);
      } else {
        setError("Product not found.");
      }
    } catch (err) {
      setError("Failed to fetch data.");
    }
    setLoading(false);
  };

  const fetchFoodByName = async () => {
    setLoading(true);
    setFoodDataList([]);
    setSelectedProduct(null);
    setError("");
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${productName}&search_simple=1&json=1`
      );
      if (response.data.products && response.data.products.length > 0) {
        setFoodDataList(response.data.products);
      } else {
        setError("No products found.");
      }
    } catch (err) {
      setError("Failed to fetch data.");
    }
    setLoading(false);
  };

  return (
    <div className="w-[98%] mx-auto mt-6 px-4">
      {/* Search Input Section */}
      <SearchInput
        barcode={barcode}
        setBarcode={setBarcode}
        productName={productName}
        setProductName={setProductName}
        fetchFoodByBarcode={fetchFoodByBarcode}
        fetchFoodByName={fetchFoodByName}
      />

      {/* Loading Spinner */}
      {loading && <div className="text-center mt-4 text-white animate-spin">🔄</div>}

      {/* Error Message */}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {/* Sidebar Layout: Search & List on Left, Details on Right */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 mt-6">
        {/* Left: Product List */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <ProductList foodDataList={foodDataList} setSelectedProduct={setSelectedProduct} />
        </div>

        {/* Right: Product Details & Nutritional Info */}
        <div className="flex flex-col gap-4">
          {/* Product Details */}
          <div className="bg-gray-900 p-4 rounded-lg">
            {selectedProduct && <ProductDetails selectedProduct={selectedProduct} />}
          </div>

          {/* Nutritional Breakdown & Chart */}
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <NutritionalBreakdown selectedProduct={selectedProduct} />
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <NutritionalChart
                  labels={["Energy (kcal)", "Fat (g)", "Sugars (g)", "Salt (g)"]}
                  values={[
                    selectedProduct.nutriments?.energy_kcal || 0,
                    selectedProduct.nutriments?.fat || 0,
                    selectedProduct.nutriments?.sugars || 0,
                    selectedProduct.nutriments?.salt || 0,
                  ]}
                  label="Nutrition Per 100g"
                />
              </div>
            </div>
          )}

          {/* Additional Product Info */}
          {selectedProduct && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <DetailedInfo selectedProduct={selectedProduct} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodSearch;

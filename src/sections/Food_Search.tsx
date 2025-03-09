"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchInput from "./SearchInput";
import ProductList from "./ProductList";
import ProductDetails from "./ProductDetails";
import DetailedInfo from "./DetailedInfo";
import NutritionalChart from "./NutritionalChart";
import SkeletonLoader from "./SkeletonLoader";
import HealthInfo from "./HealthInfo";
import { findSubstitutes } from "@/lib/substituteFinder";

const FoodSearch: React.FC = () => {
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [foodDataList, setFoodDataList] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [substitutes, setSubstitutes] = useState<any[]>([]);
  const [substituteLoading, setSubstituteLoading] = useState(false);
  const [healthData, setHealthData] = useState({ healthIssues: [], allergies: [] });
  const [productInfo, setProductInfo] = useState<any>(null);

  useEffect(() => {
    const userHealthData = JSON.parse(localStorage.getItem("userHealthData") || "{}");
    setHealthData({
      healthIssues: userHealthData.healthIssues || [],
      allergies: userHealthData.allergies || [],
    });
  }, []);

  const handleFindSubstitutes = async (product: any) => {
    if (!product) return;
    setSubstituteLoading(true);
    try {
      const substitutes = await findSubstitutes(product, healthData);
      setSubstitutes(substitutes);
    } catch (error) {
      console.error("Substitute search failed:", error);
    }
    setSubstituteLoading(false);
  };

  const fetchAdditionalProductInfo = async (name: string) => {
    if (!name) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/product-info?productName=${encodeURIComponent(name)}`);
      if (data.error) {
        setError(data.error);
      } else {
        setProductInfo(data);
      }
    } catch {
      setError("Failed to fetch product information.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = async (product: any) => {
    setSelectedProduct(product);
    handleFindSubstitutes(product);

    if (product.product_name) {
      fetchAdditionalProductInfo(product.product_name);
    }
  };

  const fetchFoodByBarcode = async () => {
    if (!barcode) return;
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      if (data.status === 1 && data.product) {
        setSelectedProduct(data.product);
        handleFindSubstitutes(data.product);
        fetchAdditionalProductInfo(data.product.product_name);
      } else {
        setError("Product not found.");
      }
    } catch {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodByName = async () => {
    if (!productName) return;
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${productName}&search_simple=1&json=1`);
      if (data.products && data.products.length > 0) {
        setFoodDataList(data.products);
      } else {
        setError("No products found.");
      }
    } catch {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[98%] mx-auto mt-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        {/* Search Panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <SearchInput
              barcode={barcode}
              setBarcode={setBarcode}
              productName={productName}
              setProductName={setProductName}
              fetchFoodByBarcode={fetchFoodByBarcode}
              fetchFoodByName={fetchFoodByName}
            />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg flex-1">
            {loading ? <SkeletonLoader type="list" /> : <ProductList foodDataList={foodDataList} setSelectedProduct={handleProductSelect} />}
          </div>
        </div>

        {/* Product Details Panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-lg">
            {loading ? <SkeletonLoader type="details" /> : selectedProduct && <ProductDetails selectedProduct={selectedProduct} />}
          </div>

          {selectedProduct && productInfo && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-xl font-semibold">Additional Information</h2>
              <p className="text-gray-700">{productInfo.description}</p>
              <h3 className="mt-2 text-lg font-semibold">Health Concerns:</h3>
              <p className="text-black-500">{productInfo.healthConcerns}</p>
            </div>
          )}
          
          {selectedProduct && <DetailedInfo selectedProduct={selectedProduct} />}
          {/* {selectedProduct && <HealthInfo selectedProduct={selectedProduct} />} */}
          
          {selectedProduct && (
            <NutritionalChart
              labels={["Energy", "Carbs", "Fat", "Sugars", "Salt", "Fibre", "Proteins"]}
              values={[
                selectedProduct.nutriments?.energy_100g / 100 || 0,
                selectedProduct.nutriments?.carbohydrates_100g || 0,
                selectedProduct.nutriments?.fat_100g || 0,
                selectedProduct.nutriments?.sugars_100g || 0,
                selectedProduct.nutriments?.salt_100g || 0,
                selectedProduct.nutriments?.fibre_100g || 0,
                selectedProduct.nutriments?.proteins_100g || 0,
              ]}
              label="Nutrition Per 100g"
            />
          )}
        </div>
      </div>

      {/* Substitutes Section */}
      {substitutes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Healthier Alternatives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {substitutes.map((sub) => (
              <div key={sub.code} className="bg-gray-800 p-4 rounded-lg">
                <img src={sub.image_url} alt={sub.product_name} className="w-full h-48 object-contain mb-4" />
                <h3 className="text-lg font-semibold text-white">{sub.product_name || "Unnamed Product"}</h3>
                <button onClick={() => handleProductSelect(sub)} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {substituteLoading && <p className="text-purple-500 mt-2 text-center">Finding healthier alternatives...</p>}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default FoodSearch;

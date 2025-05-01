// /section/Food_search.tsx

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
import { findSubstitutes, isNutritionallyBetter } from "@/lib/substituteFinder";
import { healthRules } from "@/lib/healthRules";
import HealthWarnings from "@/components/FoodSafetyAlert";
import jwt from "jsonwebtoken";
import FoodSafetyAlert from "@/components/FoodSafetyAlert";

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
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const userHealthData = JSON.parse(localStorage.getItem("userHealthData") || "{}");
    setHealthData({
      healthIssues: userHealthData.healthIssues || [],
      allergies: userHealthData.allergies || [],
    });
  }, []);

  // sections/Food_Search.tsx

  const handleFindSubstitutes = async (product: any) => {
    if (!product) return;
    setSubstituteLoading(true);
    try {
      const substitutes = await findSubstitutes(product, healthData);

      // // Additional filter for nutritional criteria
      // const filteredSubstitutes = substitutes.filter(sub => 
      //   isNutritionallyBetter(sub, product, healthData.healthIssues, healthRules)
      // );

      setSubstitutes(substitutes);
      // console.log(filteredSubstitutes);
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
    fetchAdditionalProductInfo(product.product_name);

  };



  const fetchFoodByBarcode = async () => {
    if (!barcode) return;
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json?lc=en`);
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
      const { data } = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${productName}&search_simple=1&json=1&lc=en`);
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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log("token: ", token);
        if (!token) return;

        const decoded = jwt.decode(token);
        if (!decoded || typeof decoded === "string" || !("email" in decoded)) return;

        const response = await axios.get(`/api/profile?email=${encodeURIComponent(decoded.email)}`);
        if (response.data.profile) {
          console.log("profile: ", response.data.profile);
          setUserProfile(response.data.profile);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

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

          {selectedProduct && userProfile && (
            <FoodSafetyAlert
              product={selectedProduct}
              profile={userProfile}
            />
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



      {substitutes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Healthier Alternatives</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {substitutes.map((sub) => (
              <div key={sub.code || sub._id || sub.product_name} className="bg-gray-800 p-4 rounded-lg">
                {sub.image_url ? (
                  <img
                    src={sub.image_url}
                    alt={sub.product_name}
                    className="w-full h-48 object-contain mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-700 flex items-center justify-center mb-4">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white">
                  {sub.product_name || "Unnamed Product"}
                </h3>
                <div className="mt-2 text-sm text-gray-300">
                  {sub.brands && <p>Brand: {sub.brands}</p>}
                  {sub.quantity && <p>Size: {sub.quantity}</p>}
                </div>
                <button
                  onClick={() => handleProductSelect(sub)}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors"
                >
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

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
import { 
  findSubstitutes
} from "@/lib/substituteFinder";

const FoodSearch: React.FC = () => {
  const [barcode, setBarcode] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [foodDataList, setFoodDataList] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [substitutes, setSubstitutes] = useState<any[]>([]);
  const [substituteLoading, setSubstituteLoading] = useState(false);
  const [healthData, setHealthData] = useState<{ 
    healthIssues: string[], 
    allergies: string[] 
  }>({ healthIssues: [], allergies: [] });

  useEffect(() => {
    const userHealthData = JSON.parse(localStorage.getItem("userHealthData") || "{}");
    setHealthData({
      healthIssues: userHealthData.healthIssues || [],
      allergies: userHealthData.allergies || []
    });
  }, []);

  const handleFindSubstitutes = async (originalProduct: any) => {
    if (!originalProduct) return;
    setSubstituteLoading(true);
    try {
      const substitutes = await findSubstitutes(originalProduct, healthData);
      setSubstitutes(substitutes);
    } catch (error) {
      console.error("Substitute search failed:", error);
    }
    setSubstituteLoading(false);
  };

  const handleProductSelect = async (product: any) => {
    setSelectedProduct(product);
    setLoading(false);
    handleFindSubstitutes(product);
  };

  const fetchFoodByBarcode = async () => {
    if (!barcode) return;
    setLoading(true);
    setSelectedProduct(null);
    setError("");

    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      if (response.data.status === 1 && response.data.product) {
        handleProductSelect(response.data.product);
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
    } catch {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[98%] mx-auto mt-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
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
            {loading ? (
              <SkeletonLoader type="list" />
            ) : (
              <ProductList
                foodDataList={foodDataList}
                setSelectedProduct={handleProductSelect}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-lg">
            {loading ? (
              <SkeletonLoader type="details" />
            ) : (
              selectedProduct && <ProductDetails selectedProduct={selectedProduct} />
            )}
          </div>

          {selectedProduct && <DetailedInfo selectedProduct={selectedProduct} />}
          {selectedProduct && <HealthInfo selectedProduct={selectedProduct} />}

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

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default FoodSearch;

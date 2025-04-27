// lib/substituteFinder.ts

import { HealthCondition, healthRules } from "@/lib/healthRules";

import axios from "axios";

interface Product {
  code?: string;
  _id?: string;
  categories_tags?: string[];
  ingredients_text?: string;
  nutriments?: {
    [key: string]: number | undefined;
  };
  stores_tags?: string[];
  countries_tags?: string[];
  [key: string]: any;
}

interface HealthData {
  healthIssues: string[];
  allergies: string[];
}

export const getProductCategory = (product: Product): string => {
  return product.categories_tags?.[0]?.replace(/en:/g, "") || "generic";
};

export const hasAllergens = (product: Product, allergies: string[]): boolean => {
  const ingredients = product.ingredients_text?.toLowerCase() || "";
  return allergies.some(allergy => ingredients.includes(allergy.toLowerCase()));
};

export const isWidelyAvailable = (product: Product): boolean => {
  return (product.stores_tags?.length || 0) >= 3 && 
         (product.countries_tags?.length || 0) >= 2;
};

export const isNutritionallyBetter = (
  product: Product,
  originalProduct: Product,
  healthIssues: string[],
  healthRules: typeof healthRules
): boolean => {
  const nutrition = product.nutriments || {};
  const originalNutrition = originalProduct.nutriments || {};

  return healthIssues.every(issue => {
    const condition = issue.toLowerCase() as HealthCondition;
    const rules = healthRules[condition] || {};

    if (rules.maxSugarPer100g) {
      const subSugar = Number(nutrition.sugars_100g) || 0;
      const origSugar = Number(originalNutrition.sugars_100g) || 0;
      return subSugar < Math.min(origSugar * 0.7, rules.maxSugarPer100g);
    }

    if (rules.maxSaturatedFatPer100g) {
      const subFat = Number(nutrition.saturated_fat_100g) || 0;
      const origFat = Number(originalNutrition.saturated_fat_100g) || 0;
      return subFat < Math.min(origFat * 0.7, rules.maxSaturatedFatPer100g);
    }

    return true;
  });
};

export const getChatGPTSubstitutes = async (productName: string, healthData: HealthData): Promise<string[]> => {
  try {
    const response = await fetch('/api/product-info/substitutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productName,healthIssues: healthData.healthIssues,
        allergies: healthData.allergies }),
    });

    if (!response.ok) throw new Error('Failed to get substitutes from ChatGPT');
    
    const data = await response.json();
    console.log("substitues: ", data);
    return data.substitutes;
  } catch (error) {
    console.error('ChatGPT substitute search failed:', error);
    return [];
  }
};

export const findSubstitutes = async (
  originalProduct: Product,
  healthData: HealthData
): Promise<Product[]> => {
  try {
    const chatGPTSubstitutes = await getChatGPTSubstitutes(originalProduct.product_name || originalProduct.code || '', healthData);
    
    const verifiedSubstitutes = await Promise.all(
      chatGPTSubstitutes.map(async (substituteName) => {
        try {
          const response = await axios.get(
            `/api/proxy?query=${encodeURIComponent(
              `search_terms=${substituteName}&json=1&page_size=1`
            )}`
          );
          return response.data.products?.[0] || null;
        } catch (error) {
          console.error(`Failed to fetch ${substituteName}:`, error);
          return null;
        }
      })
    );

    return verifiedSubstitutes.filter((product): product is Product => (
      product !== null &&
      product.code !== originalProduct.code &&
      !hasAllergens(product, healthData.allergies)
    )).slice(0, 5);
  } catch (error) {
    console.error("Substitute search failed:", error);
    return [];
  }
};
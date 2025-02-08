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

export const findSubstitutes = async (
  originalProduct: Product,
  healthData: HealthData
): Promise<Product[]> => {
  try {
    const category = getProductCategory(originalProduct);
    const response = await axios.get(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(category)}&json=1&sort_by=popularity&page_size=30`
    );

    return response.data.products?.filter((product: Product) => (
      product.code !== originalProduct.code &&
      !hasAllergens(product, healthData.allergies) &&
      isNutritionallyBetter(product, originalProduct, healthData.healthIssues, healthRules) &&
      isWidelyAvailable(product)
    )).slice(0, 5) || [];
  } catch (error) {
    console.error("Substitute search failed:", error);
    return [];
  }
};
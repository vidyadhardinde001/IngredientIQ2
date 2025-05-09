// /lib/healthRules.ts

export const healthRules = {
  diabetes: {
    maxSugarPer100g: 10,
    maxCarbsPer100g: 30,
    avoidIngredients: ["sugar", "corn syrup"],
  },
  heart: {
    maxSaturatedFatPer100g: 2,
    maxSodiumPer100g: 200,
    avoidIngredients: ["palm oil", "hydrogenated fat"],
  },
  gluten: {
    avoidIngredients: ["wheat", "barley", "rye"],
  },
  hypertension: {
    maxSalt: 1.5, // grams per 100g
  },
} as const;

export type HealthCondition = keyof typeof healthRules;

export type HealthRules = typeof healthRules;

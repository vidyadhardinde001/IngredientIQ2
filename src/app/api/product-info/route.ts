// src/app/api/product-info/route.ts
import { NextResponse } from "next/server";
import Redis from "ioredis";
import axios from "axios";
import * as cheerio from "cheerio";
import ingredients from "./ingrediant.json";

const redis = new Redis(process.env.REDIS_URL!);

function sanitizeHtml(text: string): string {
  return text
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function scrapeProductDescription(productName: string): Promise<string> {
  try {
    const response = await axios.get(
      `https://en.wikipedia.org/w/api.php`,
      {
        params: {
          action: "query",
          format: "json",
          prop: "extracts",
          exintro: true,
          titles: productName
        },
        headers: {
          "User-Agent": "FoodSearchApp/1.0 (contact@example.com)"
        },
        timeout: 5000
      }
    );
    
    const pages = response.data.query.pages;
    const pageId = Object.keys(pages)[0];
    return sanitizeHtml(pages[pageId]?.extract || "");
  } catch (error) {
    console.error("Wikipedia scraping error:", error);
    return "";
  }
}

function getHealthConcerns(ingredientsText: string): string[] {
  const concerns: string[] = [];
  const ingredientList = ingredientsText
    .toLowerCase()
    .split(/[,;]| and |\(|\)|\//)
    .map(item => item.trim().replace(/\./g, '').replace(/\bpowder\b|\boil\b/g, '')) // Remove common modifiers
    .filter(item => item.length > 2);

  ingredients.forEach((item: { ingredient: string; health_concern: string }) => {
    const lowerIngredient = item.ingredient.toLowerCase();
    ingredientList.forEach(ing => {
      // Improved matching for compound ingredients
      const matchScore = lowerIngredient.split(' ').filter(word => 
        ing.includes(word) || word.includes(ing)
      ).length;
      
      if (matchScore > 0) {
        concerns.push(item.health_concern);
      }
    });
  });

  return [...new Set(concerns)];
}

async function scrapeAdditionalHealthInfo(ingredient: string): Promise<string> {
  try {
    // Try Wikipedia health effects section
    const wikiResponse = await axios.get(
      `https://en.wikipedia.org/wiki/${encodeURIComponent(ingredient)}`,
      {
        headers: {
          "User-Agent": "FoodSearchApp/1.0 (contact@example.com)"
        },
        timeout: 5000
      }
    );

    const $wiki = cheerio.load(wikiResponse.data);
    const healthContent = $wiki('#Health_effects, .health-risks').first().text();
    
    if (healthContent.length > 50) {
      return sanitizeHtml(healthContent).substring(0, 200);
    }

    // Fallback to WebMD
    const webmdResponse = await axios.get(
      `https://www.webmd.com/vitamins/ai/ingredientmono-1/${encodeURIComponent(ingredient)}`,
      {
        headers: {
          "User-Agent": "FoodSearchApp/1.0 (contact@example.com)"
        },
        timeout: 5000
      }
    );

    const $webmd = cheerio.load(webmdResponse.data);
    return sanitizeHtml($webmd('.monograph-content p').first().text()).substring(0, 200);
  } catch (error) {
    console.error(`Health scraping error for ${ingredient}:`, error);
    return ""; // Return empty string on failure
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productName = searchParams.get("productName")?.trim();
  const ingredientsText = searchParams.get("ingredients")?.trim() || "";

  if (!productName) {
    return NextResponse.json(
      { error: "Product name is required" },
      { status: 400 }
    );
  }

  try {
    const cacheKey = `product-info:${productName.toLowerCase()}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Scrape product description
    const rawDescription = await scrapeProductDescription(productName);
    const description = rawDescription 
      ? `${sanitizeHtml(rawDescription).substring(0, 300)}...`
      : "Product description not available.";

    // Get health concerns
    const healthConcerns = getHealthConcerns(ingredientsText);
    const missingIngredients = ingredientsText
      .split(/[,;]| and /)
      .map(item => item.trim())
      .filter(item => 
        item.length > 2 && 
        !ingredients.some(i => 
          i.ingredient.toLowerCase().includes(item.toLowerCase()) ||
          item.toLowerCase().includes(i.ingredient.toLowerCase())
        )
      );

    // Scrape additional concerns
    const scrapedResults = await Promise.all(
      missingIngredients.slice(0, 3).map(async ingredient => {
        const concern = await scrapeAdditionalHealthInfo(ingredient);
        return concern ? `${ingredient}: ${concern}` : null;
      })
    );

    const finalHealthConcerns = [
      ...healthConcerns,
      ...scrapedResults.filter(Boolean)
    ].slice(0, 5);

    const result = {
      productName,
      description,
      healthConcerns: finalHealthConcerns.length > 0 
        ? finalHealthConcerns 
        : ["No major health concerns identified through automated analysis"]
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 86400);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to gather product information. Please try again later." },
      { status: 500 }
    );
  }
}
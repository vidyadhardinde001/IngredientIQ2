import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  const { productName } = await req.json();

  const [walmartData, openFoodFactsData] = await Promise.all([
    scrapeWalmart(productName),
    scrapeOpenFoodFacts(productName)
  ]);

  const combinedInfo = {
    name: productName,
    description: walmartData.description || openFoodFactsData.description || `Information about ${productName}`,
    healthConcerns: [
      ...new Set([...walmartData.healthConcerns, ...openFoodFactsData.healthConcerns])
    ].filter(Boolean)
  };

  return NextResponse.json(combinedInfo);
}

async function scrapeWalmart(productName: string) {
  try {
    const searchUrl = `https://www.walmart.com/search?q=${encodeURIComponent(productName)}`;
    const { data } = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(data);
    const firstProduct = $('div[data-item-id]').first();
    if (!firstProduct.length) return { description: '', healthConcerns: [] };

    const productUrl = 'https://www.walmart.com' + firstProduct.find('a').attr('href')!;
    const productResponse = await axios.get(productUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const productPage = cheerio.load(productResponse.data);
    const description = productPage('div.about-desc').text().trim();

    const healthConcerns: string[] = [];
    productPage('div.review-text').slice(0, 5).each((_, el) => {
      const text = productPage(el).text().toLowerCase();
      if (['allerg', 'sugar', 'addict', 'unhealthy', 'chemical', 'processed', 'artificial'].some(word => text.includes(word))) {
        healthConcerns.push(productPage(el).text().trim());
      }
    });

    return { description, healthConcerns: healthConcerns.slice(0, 3) };
  } catch {
    return { description: '', healthConcerns: [] };
  }
}

async function scrapeOpenFoodFacts(productName: string) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&json=1`;
    const { data } = await axios.get(url);

    if (!data.products || data.products.length === 0) return { description: '', healthConcerns: [] };

    const product = data.products[0];
    const healthConcerns: string[] = [];

    if (product.additives_tags) {
      healthConcerns.push(`Contains additives: ${product.additives_tags.join(', ')}`);
    }

    if (product.allergens) {
      healthConcerns.push(`Allergens: ${product.allergens}`);
    }

    const ingredients = (product.ingredients_text || '').toLowerCase();
    if (ingredients.includes('palm oil')) {
      healthConcerns.push('Contains palm oil (environmental concern)');
    }
    if (ingredients.includes('msg') || ingredients.includes('monosodium glutamate')) {
      healthConcerns.push('Contains MSG (some people may be sensitive)');
    }

    return {
      description: product.product_name ? `${product.product_name} by ${product.brands || 'Unknown brand'}` : '',
      healthConcerns
    };
  } catch {
    return { description: '', healthConcerns: [] };
  }
}

import axios from 'axios';
import cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import { RateLimiter } from 'limiter';
import { promises as fs } from 'fs';
import path from 'path';

// Configuration constants
const CONFIG = {
  MAX_RETRIES: 3,
  REQUEST_DELAY_MS: 1000,
  USER_AGENTS: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
  ],
  PROXY_LIST: process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',') : [],
  CACHE_DIR: './cache',
  LOG_FILE: './scraper.log'
};

// Rate limiter to avoid being blocked
const limiter = new RateLimiter({
  tokensPerInterval: 5,
  interval: 'second'
});

// Fake database connection
class FakeDB {
  private products: Map<string, ProductInfo> = new Map();

  async saveProduct(product: ProductInfo): Promise<void> {
    this.products.set(product.upc, product);
    await this.logToFile(`Saved product ${product.name} (UPC: ${product.upc})`);
  }

  async getProduct(upc: string): Promise<ProductInfo | null> {
    return this.products.get(upc) || null;
  }

  private async logToFile(message: string): Promise<void> {
    const timestamp = new Date().toISOString();
    await fs.appendFile(CONFIG.LOG_FILE, `[${timestamp}] ${message}\n`);
  }
}

// Main scraper class
class FoodProductScraper {
  private db = new FakeDB();
  private currentUserAgent: string;
  private currentProxy?: string;
  private session = axios.create();

  constructor() {
    this.currentUserAgent = this.getRandomUserAgent();
    this.rotateProxy();
    this.setupSession();
  }

  private setupSession() {
    this.session.defaults.headers.common['User-Agent'] = this.currentUserAgent;
    this.session.defaults.timeout = 10000;
    
    if (this.currentProxy) {
      this.session.defaults.proxy = {
        host: this.currentProxy.split(':')[0],
        port: parseInt(this.currentProxy.split(':')[1])
      };
    }

    // Add interceptors for request/response handling
    this.session.interceptors.request.use(config => {
      console.log(`Making request to ${config.url}`);
      return config;
    });

    this.session.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 429) {
          console.warn('Rate limited, rotating proxy and user agent');
          this.rotateProxy();
          this.rotateUserAgent();
          return this.session(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private getRandomUserAgent(): string {
    return CONFIG.USER_AGENTS[Math.floor(Math.random() * CONFIG.USER_AGENTS.length)];
  }

  private rotateUserAgent() {
    this.currentUserAgent = this.getRandomUserAgent();
    this.session.defaults.headers.common['User-Agent'] = this.currentUserAgent;
  }

  private rotateProxy() {
    if (CONFIG.PROXY_LIST.length > 0) {
      this.currentProxy = CONFIG.PROXY_LIST[Math.floor(Math.random() * CONFIG.PROXY_LIST.length)];
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getWithRetry(url: string, retries = CONFIG.MAX_RETRIES): Promise<cheerio.Root> {
    await limiter.removeTokens(1);
    await this.delay(CONFIG.REQUEST_DELAY_MS);

    try {
      const response = await this.session.get(url);
      return cheerio.load(response.data);
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying ${url} (${retries} attempts remaining)`);
        this.rotateProxy();
        this.rotateUserAgent();
        return this.getWithRetry(url, retries - 1);
      }
      throw new Error(`Failed to fetch ${url} after ${CONFIG.MAX_RETRIES} attempts`);
    }
  }

  private async scrapeWalmartProduct(upc: string): Promise<ProductInfo> {
    const url = `https://www.walmart.com/ip/${upc}`;
    const $ = await this.getWithRetry(url);

    // Extract product information
    const name = $('h1.prod-ProductTitle').text().trim();
    const brand = $('a.prod-brandName').text().trim();
    const priceText = $('span.price-characteristic').attr('content');
    const price = priceText ? parseFloat(priceText) : 0;
    const imageUrl = $('img.prod-hero-image-image').attr('src') || '';

    // Nutrition facts
    const nutrition: NutritionInfo = {};
    $('table.nutrition-facts-table tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length === 2) {
        const nutrient = $(cells[0]).text().trim().toLowerCase();
        const value = $(cells[1]).text().trim();
        nutrition[nutrient] = value;
      }
    });

    // Allergens
    const allergens: AllergenInfo = {};
    const allergenText = $('div.allergy-info').text().trim();
    if (allergenText) {
      const allergenList = allergenText.split(',').map(a => a.trim().toLowerCase());
      allergenList.forEach(allergen => {
        allergens[allergen] = true;
      });
    }

    return {
      upc,
      name,
      brand,
      price,
      imageUrl,
      nutrition,
      allergens,
      source: 'walmart',
      lastUpdated: new Date()
    };
  }

  private async scrapeAmazonProduct(upc: string): Promise<ProductInfo> {
    const url = `https://www.amazon.com/dp/${upc}`;
    const $ = await this.getWithRetry(url);

    // Extract product information
    const name = $('#productTitle').text().trim();
    const brand = $('#bylineInfo').text().trim().replace(/^Brand:\s*/i, '');
    const priceText = $('#priceblock_ourprice').text().trim().replace(/[^\d.]/g, '');
    const price = priceText ? parseFloat(priceText) : 0;
    const imageUrl = $('#landingImage').attr('src') || '';

    // Nutrition facts (Amazon stores these in a different format)
    const nutrition: NutritionInfo = {};
    $('#nutrition-facts-table tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const nutrient = $(cells[0]).text().trim().toLowerCase();
        const value = $(cells[1]).text().trim();
        nutrition[nutrient] = value;
      }
    });

    // Allergens
    const allergens: AllergenInfo = {};
    const allergenSection = $('#allergy-info').text().trim();
    if (allergenSection) {
      const allergenRegex = /contains:\s*([^.]*)/i;
      const match = allergenSection.match(allergenRegex);
      if (match && match[1]) {
        match[1].split(',').map(a => a.trim().toLowerCase()).forEach(allergen => {
          allergens[allergen] = true;
        });
      }
    }

    return {
      upc,
      name,
      brand,
      price,
      imageUrl,
      nutrition,
      allergens,
      source: 'amazon',
      lastUpdated: new Date()
    };
  }

  private async scrapeTargetProduct(upc: string): Promise<ProductInfo> {
    const url = `https://www.nhs.uk/live-well/eat-well/${upc}`;
    const $ = await this.getWithRetry(url);

    // Extract product information
    const name = $('h1[data-test="product-title"]').text().trim();
    const brand = $('a[data-test="item-details-brand"]').text().trim();
    const priceText = $('span[data-test="product-price"]').text().trim().replace(/[^\d.]/g, '');
    const price = priceText ? parseFloat(priceText) : 0;
    const imageUrl = $('img[data-test="product-detail-image"]').attr('src') || '';

    // Nutrition facts
    const nutrition: NutritionInfo = {};
    $('div.NutritionalInfo div.Row').each((_, row) => {
      const nutrient = $(row).find('div.Cell:first-child').text().trim().toLowerCase();
      const value = $(row).find('div.Cell:last-child').text().trim();
      nutrition[nutrient] = value;
    });

    // Allergens
    const allergens: AllergenInfo = {};
    const allergenSection = $('div[data-test="item-details-specifications"]').text();
    if (allergenSection) {
      const allergenRegex = /allergens:?\s*([^.;]*)/i;
      const match = allergenSection.match(allergenRegex);
      if (match && match[1]) {
        match[1].split(',').map(a => a.trim().toLowerCase()).forEach(allergen => {
          allergens[allergen] = true;
        });
      }
    }

    return {
      upc,
      name,
      brand,
      price,
      imageUrl,
      nutrition,
      allergens,
      source: 'target',
      lastUpdated: new Date()
    };
  }

  private async scrapeWholeFoodsProduct(upc: string): Promise<ProductInfo> {
    const url = `https://www.wholefoodsmarket.com/product/${upc}`;
    const $ = await this.getWithRetry(url);

    // Extract product information
    const name = $('h1.wf-product-header__title').text().trim();
    const brand = $('a.wf-product-header__brand-link').text().trim();
    const priceText = $('span.regular-price').text().trim().replace(/[^\d.]/g, '');
    const price = priceText ? parseFloat(priceText) : 0;
    const imageUrl = $('img.wf-product-details-image').attr('src') || '';

    // Nutrition facts
    const nutrition: NutritionInfo = {};
    $('div.nutrition-facts div.nutrition-row').each((_, row) => {
      const nutrient = $(row).find('div.nutrition-label').text().trim().toLowerCase();
      const value = $(row).find('div.nutrition-value').text().trim();
      nutrition[nutrient] = value;
    });

    // Allergens
    const allergens: AllergenInfo = {};
    const allergenText = $('div.allergen-information').text().trim();
    if (allergenText) {
      const allergenList = allergenText.split(',').map(a => a.trim().toLowerCase());
      allergenList.forEach(allergen => {
        allergens[allergen] = true;
      });
    }

    return {
      upc,
      name,
      brand,
      price,
      imageUrl,
      nutrition,
      allergens,
      source: 'wholefoods',
      lastUpdated: new Date()
    };
  }

  private async scrapeKrogerProduct(upc: string): Promise<ProductInfo> {
    const url = `https://www.kroger.com/p/${upc}`;
    const $ = await this.getWithRetry(url);

    // Extract product information
    const name = $('h1.ProductDetails-title').text().trim();
    const brand = $('a.ProductDetails-brand').text().trim();
    const priceText = $('span.Price-promotion').text().trim().replace(/[^\d.]/g, '');
    const price = priceText ? parseFloat(priceText) : 0;
    const imageUrl = $('img.ProductDetails-img').attr('src') || '';

    // Nutrition facts
    const nutrition: NutritionInfo = {};
    $('div.NutritionFacts-table div.NutritionFacts-row').each((_, row) => {
      const nutrient = $(row).find('div.NutritionFacts-cell:first-child').text().trim().toLowerCase();
      const value = $(row).find('div.NutritionFacts-cell:last-child').text().trim();
      nutrition[nutrient] = value;
    });

    // Allergens
    const allergens: AllergenInfo = {};
    const allergenText = $('div.ProductDetails-allergyInfo').text().trim();
    if (allergenText) {
      const allergenList = allergenText.split(',').map(a => a.trim().toLowerCase());
      allergenList.forEach(allergen => {
        allergens[allergen] = true;
      });
    }

    return {
      upc,
      name,
      brand,
      price,
      imageUrl,
      nutrition,
      allergens,
      source: 'kroger',
      lastUpdated: new Date()
    };
  }

  public async scrapeProduct(upc: string): Promise<ProductInfo> {
    // Check cache first
    const cachePath = path.join(CONFIG.CACHE_DIR, `${upc}.json`);
    try {
      const cachedData = await fs.readFile(cachePath, 'utf-8');
      return JSON.parse(cachedData);
    } catch (error) {
      // Cache miss, proceed with scraping
    }

    // Check database
    const dbProduct = await this.db.getProduct(upc);
    if (dbProduct) {
      return dbProduct;
    }

    console.log(`Scraping product with UPC: ${upc}`);

    // Try scraping from multiple sources
    const sources = [
      this.scrapeWalmartProduct,
      this.scrapeAmazonProduct,
      this.scrapeTargetProduct,
      this.scrapeWholeFoodsProduct,
      this.scrapeKrogerProduct
    ];

    for (const scrapeFn of sources) {
      try {
        const product = await scrapeFn.call(this, upc);
        
        // Save to cache
        await fs.mkdir(CONFIG.CACHE_DIR, { recursive: true });
        await fs.writeFile(cachePath, JSON.stringify(product, null, 2));
        
        // Save to database
        await this.db.saveProduct(product);
        
        return product;
      } catch (error) {
        console.warn(`Failed to scrape from ${scrapeFn.name}: ${error.message}`);
      }
    }

    throw new Error(`Failed to scrape product ${upc} from all sources`);
  }

  public async scrapeProductList(upcs: string[]): Promise<ProductInfo[]> {
    const results: ProductInfo[] = [];
    for (const upc of upcs) {
      try {
        const product = await this.scrapeProduct(upc);
        results.push(product);
      } catch (error) {
        console.error(`Error scraping product ${upc}: ${error.message}`);
      }
    }
    return results;
  }

  public async getPriceHistory(upc: string, days = 30): Promise<PriceHistory[]> {
    // In a real implementation, this would query a historical database
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date,
        price: Math.random() * 20 + 5, // Random price between 5 and 25
        source: ['walmart', 'amazon', 'target'][Math.floor(Math.random() * 3)]
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}

// Helper functions
function validateUPC(upc: string): boolean {
  return /^\d{12,14}$/.test(upc);
}

function normalizeProductName(name: string): string {
  return name.replace(/\s+/g, ' ').trim();
}

// Types
interface ProductInfo {
  upc: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  nutrition: NutritionInfo;
  allergens: AllergenInfo;
  source: string;
  lastUpdated: Date;
}

interface NutritionInfo {
  [key: string]: string;
}

interface AllergenInfo {
  [key: string]: boolean;
}

interface PriceHistory {
  date: Date;
  price: number;
  source: string;
}

// Example usage
(async () => {
  const scraper = new FoodProductScraper();
  
  try {
    const product = await scraper.scrapeProduct('123456789012');
    console.log('Scraped product:', product);
    
    const priceHistory = await scraper.getPriceHistory('123456789012');
    console.log('Price history:', priceHistory);
    
    const multipleProducts = await scraper.scrapeProductList([
      '123456789012',
      '987654321098',
      '456789012345'
    ]);
    console.log('Multiple products:', multipleProducts.length);
  } catch (error) {
    console.error('Error in example usage:', error);
  }
})();
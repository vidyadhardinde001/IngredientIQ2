import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface AgeGroupRating {
  ageGroup: string;
  averageRating: number;
  reviewCount: number;
  positiveComments: string[];
  negativeComments: string[];
}

interface ProductRatingInfo {
  productName: string;
  overallRating: number;
  ageGroupRatings: AgeGroupRating[];
}

export async function POST(request: Request) {
  try {
    const { productName } = await request.json();
    
    if (!productName || typeof productName !== 'string') {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    // Scrape from multiple sources
    const [amazonData, walmartData] = await Promise.all([
      scrapeAmazon(productName),
      scrapeWalmart(productName)
    ]);

    // Combine and analyze results
    const combinedRatings = analyzeAgeGroupRatings(amazonData, walmartData);
    
    return NextResponse.json({
      productName,
      overallRating: calculateOverallRating(combinedRatings),
      ageGroupRatings: combinedRatings
    });

  } catch (error) {
    console.error('Scraping failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product ratings' },
      { status: 500 }
    );
  }
}

// Helper functions (same as in the React component)
async function scrapeAmazon(productName: string) {
  try {
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(productName)}`;
    const { data } = await axios.get(searchUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US'
      }
    });

    const $ = cheerio.load(data);
    const firstProduct = $('div[data-asin]').first();
    if (!firstProduct.length) return null;

    const productId = firstProduct.attr('data-asin');
    const reviewsUrl = `https://www.amazon.com/product-reviews/${productId}`;

    const reviewsResponse = await axios.get(reviewsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const reviewsPage = cheerio.load(reviewsResponse.data);

    const reviews: { rating: number; text: string }[] = [];
    reviewsPage('div[data-hook="review"]').each((_, element) => {
      const rating = parseFloat(reviewsPage(element)
        .find('i[data-hook="review-star-rating"]')
        .text()
        .split(' ')[0]);
      
      const text = reviewsPage(element)
        .find('span[data-hook="review-body"]')
        .text()
        .trim();

      if (!isNaN(rating)) {
        reviews.push({ rating, text });
      }
    });

    return { reviews };
  } catch (error) {
    console.error('Amazon scrape failed:', error);
    return null;
  }
}

async function scrapeWalmart(productName: string) {
  try {
    const searchUrl = `https://www.walmart.com/search?q=${encodeURIComponent(productName)}`;
    const { data } = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(data);
    const firstProduct = $('div[data-item-id]').first();
    if (!firstProduct.length) return null;

    const productUrl = 'https://www.walmart.com' + firstProduct.find('a').attr('href')!;
    const productResponse = await axios.get(productUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const productPage = cheerio.load(productResponse.data);
    const reviews: { rating: number; text: string }[] = [];

    productPage('div[data-automation-id="review"]').each((_, element) => {
      const rating = parseFloat(productPage(element)
        .find('span.w_iUH7')
        .text()
        .split(' ')[0]);
      
      const text = productPage(element)
        .find('span[data-automation-id="review-text"]')
        .text()
        .trim();

      if (!isNaN(rating)) {
        reviews.push({ rating, text });
      }
    });

    return { reviews };
  } catch (error) {
    console.error('Walmart scrape failed:', error);
    return null;
  }
}

function analyzeAgeGroupRatings(amazonData: any, walmartData: any): AgeGroupRating[] {
  const ageGroups = [
    { name: "Kids (0-12)", keywords: ["child", "kid", "son", "daughter", "toy", "game"] },
    { name: "Teens (13-19)", keywords: ["teen", "student", "school", "college"] },
    { name: "Adults (20-49)", keywords: ["adult", "work", "office", "parent"] },
    { name: "Seniors (50+)", keywords: ["senior", "retired", "grand", "elderly"] }
  ];

  return ageGroups.map(group => {
    const groupReviews = [
      ...(amazonData?.reviews || []),
      ...(walmartData?.reviews || [])
    ].filter(review => 
      group.keywords.some(keyword => 
        review.text.toLowerCase().includes(keyword))
    );

    const ratings = groupReviews.map(r => r.rating);
    const average = ratings.length > 0 ? 
      (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;

    const positiveComments = groupReviews
      .filter(r => r.rating >= 4)
      .map(r => r.text)
      .slice(0, 3);

    const negativeComments = groupReviews
      .filter(r => r.rating <= 2)
      .map(r => r.text)
      .slice(0, 3);

    return {
      ageGroup: group.name,
      averageRating: parseFloat(average.toFixed(1)),
      reviewCount: groupReviews.length,
      positiveComments,
      negativeComments
    };
  });
}

function calculateOverallRating(ageGroups: AgeGroupRating[]) {
  const validGroups = ageGroups.filter(g => g.reviewCount > 0);
  if (validGroups.length === 0) return 0;
  
  const total = validGroups.reduce((sum, group) => {
    return sum + (group.averageRating * group.reviewCount);
  }, 0);
  
  const totalReviews = validGroups.reduce((sum, group) => sum + group.reviewCount, 0);
  return parseFloat((total / totalReviews).toFixed(1));
}
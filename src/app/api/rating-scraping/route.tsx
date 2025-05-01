"use client";

import { useState } from 'react';
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

export default function ProductRatingScraper() {
  const [productName, setProductName] = useState('');
  const [ratingInfo, setRatingInfo] = useState<ProductRatingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scrapeRatings = async () => {
    if (!productName.trim()) return;

    setIsLoading(true);
    try {
      // Scrape from multiple sources
      const [amazonData, walmartData] = await Promise.all([
        scrapeAmazon(productName),
        scrapeWalmart(productName)
      ]);

      // Combine and analyze results
      const combinedRatings = analyzeAgeGroupRatings(amazonData, walmartData);

      setRatingInfo({
        productName,
        overallRating: calculateOverallRating(combinedRatings),
        ageGroupRatings: combinedRatings
      });
    } catch (error) {
      console.error('Scraping failed:', error);
      alert('Failed to fetch product ratings');
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze reviews to estimate age group ratings
  const analyzeAgeGroupRatings = (amazonData: any, walmartData: any): AgeGroupRating[] => {
    // Sample analysis - in a real app you'd use more sophisticated NLP
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
          review.text.toLowerCase().includes(keyword)
        ));

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
  };

  const calculateOverallRating = (ageGroups: AgeGroupRating[]) => {
    const validGroups = ageGroups.filter(g => g.reviewCount > 0);
    if (validGroups.length === 0) return 0;

    const total = validGroups.reduce((sum, group) => {
      return sum + (group.averageRating * group.reviewCount);
    }, 0);

    const totalReviews = validGroups.reduce((sum, group) => sum + group.reviewCount, 0);
    return parseFloat((total / totalReviews).toFixed(1));
  };

  // Amazon scraper
  const scrapeAmazon = async (productName: string) => {
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
      const productUrl = `https://www.amazon.com/dp/${productId}`;
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
  };

  // Walmart scraper
  const scrapeWalmart = async (productName: string) => {
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
  };

  return (
    <div className="rating-scraper">
      <h1>Product Rating Scraper</h1>

      <div className="search-box">
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Enter product name"
        />
        <button onClick={scrapeRatings} disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Get Age Group Ratings'}
        </button>
      </div>

      {ratingInfo && (
        <div className="rating-results">
          <h2>{ratingInfo.productName}</h2>
          <div className="overall-rating">
            <h3>Overall Rating: {ratingInfo.overallRating}/5</h3>
          </div>

          <div className="age-groups">
            {ratingInfo.ageGroupRatings.map((group, index) => (
              <div key={index} className="age-group">
                <h4>{group.ageGroup} ({group.reviewCount} reviews)</h4>
                <div className="rating-bar">
                  <div
                    className="rating-fill"
                    style={{ width: `${(group.averageRating / 5) * 100}%` }}
                  >
                    {group.averageRating}/5
                  </div>
                </div>

                {group.positiveComments.length > 0 && (
                  <div className="positive-comments">
                    <h5>Positive Feedback:</h5>
                    <ul>
                      {group.positiveComments.map((comment, i) => (
                        <li key={`pos-${i}`}>{comment}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {group.negativeComments.length > 0 && (
                  <div className="negative-comments">
                    <h5>Negative Feedback:</h5>
                    <ul>
                      {group.negativeComments.map((comment, i) => (
                        <li key={`neg-${i}`}>{comment}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .rating-scraper {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .search-box {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        input {
          flex: 1;
          padding: 8px;
        }
        button {
          padding: 8px 16px;
        }
        .rating-bar {
          background: #eee;
          height: 24px;
          margin: 10px 0;
          border-radius: 12px;
          overflow: hidden;
        }
        .rating-fill {
          background: #ffd700;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #333;
        }
        .age-group {
          margin-bottom: 30px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        .positive-comments {
          background: #f0fff0;
          padding: 10px;
          margin: 10px 0;
        }
        .negative-comments {
          background: #fff0f0;
          padding: 10px;
          margin: 10px 0;
        }
        ul {
          padding-left: 20px;
        }
        li {
          margin: 5px 0;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
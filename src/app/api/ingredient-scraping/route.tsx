import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

interface Ingredient {
  ingredient: string;
  health_concern: string;
}

// Target URL (Wikipedia's list of food additives)
const URL = 'https://en.wikipedia.org/wiki/List_of_food_additives';

async function scrapeIngredients(): Promise<Ingredient[]> {
  try {
    // Fetch HTML
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    const ingredients: Ingredient[] = [];

    // Find all tables with additives (adjust selector as needed)
    $('table.wikitable').each((_, table) => {
      $(table)
        .find('tr')
        .slice(1) // Skip header row
        .each((_, row) => {
          const cols = $(row).find('td');
          if (cols.length >= 2) {
            const ingredient = $(cols[0]).text().trim();
            const health_concern = $(cols[1]).text().trim() || 'N/A';

            ingredients.push({
              ingredient,
              health_concern: health_concern,
            });
          }
        });
    });

    return ingredients;
  } catch (error) {
    console.error('Error scraping:', error);
    return [];
  }
}

// Run scraper and save to JSON
scrapeIngredients().then((data) => {
  fs.writeFileSync(
    'ingredientHealthConcerns.json',
    JSON.stringify(data, null, 2),
  );
  console.log(`✅ Scraped ${data.length} ingredients. Saved to JSON.`);
});
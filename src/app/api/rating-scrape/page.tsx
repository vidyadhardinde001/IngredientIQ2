const axios = require('axios');
const cheerio = require('cheerio');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { RateLimiter } = require('limiter');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.ewg.org/foodscores/';
const LIST_URL = `${BASE_URL}/calories-nutrition/food`;
const OUTPUT_FILE = path.join(__dirname, 'food_ratings.json');
const MAX_PRODUCTS = 10;
const MAX_RETRIES = 3;
const AGE_GROUPS = ['Kids', 'Adults', 'Seniors'];

const limiter = new RateLimiter({ tokensPerInterval: 5, interval: 'second' });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateFakeNutrition() {
    return {
        calories: randomInt(50, 500),
        fat: randomInt(0, 30),
        sugar: randomInt(0, 50),
        protein: randomInt(0, 30),
        fiber: randomInt(0, 20)
    };
}

function generateHealthRating(nutrition, ageGroup) {
    let baseScore = 5.0;
    baseScore -= (nutrition.fat > 20) ? 1.0 : 0;
    baseScore -= (nutrition.sugar > 25) ? 1.0 : 0;
    baseScore += (nutrition.fiber > 5) ? 0.5 : 0;
    baseScore += (nutrition.protein > 10) ? 0.5 : 0;
    if (ageGroup === 'Kids') baseScore -= (nutrition.sugar > 20) ? 0.5 : 0;
    if (ageGroup === 'Seniors') baseScore += (nutrition.fiber > 10) ? 0.5 : 0;
    const noise = (Math.random() - 0.5) * 1.0;
    baseScore += noise;
    if (baseScore > 10) baseScore = 10;
    if (baseScore < 0) baseScore = 0;
    return baseScore.toFixed(2);
}

async function fetchHTML(url, retries = MAX_RETRIES) {
    await limiter.removeTokens(1);
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (error) {
        if (retries > 0) {
            await sleep(1000);
            return fetchHTML(url, retries - 1);
        } else {
            console.error(`Failed to fetch ${url}:`, error.message);
            return null;
        }
    }
}

async function scrapeProductList() {
    const html = await fetchHTML(LIST_URL);
    if (!html) return [];
    const $ = cheerio.load(html);
    const products = [];
    $('a.prominent').each((i, elem) => {
        const name = $(elem).text().trim();
        const link = BASE_URL + $(elem).attr('href');
        products.push({ name, link });
    });
    return products.slice(0, MAX_PRODUCTS);
}

async function scrapeProductDetails(product) {
    const html = await fetchHTML(product.link);
    if (!html) return null;
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const descriptionElem = document.querySelector('.factTitle');
    const description = descriptionElem ? descriptionElem.textContent.trim() : "No description available";
    return {
        ...product,
        description
    };
}

function createRatings(product) {
    const nutrition = generateFakeNutrition();
    const ratings = AGE_GROUPS.map(ageGroup => ({
        ageGroup,
        rating: generateHealthRating(nutrition, ageGroup)
    }));
    return {
        ...product,
        nutrition,
        ratings
    };
}

function showProgress(current, total) {
    const percentage = ((current / total) * 100).toFixed(2);
    const bars = Math.floor((percentage / 100) * 20);
    const barStr = '[' + '='.repeat(bars) + ' '.repeat(20 - bars) + ']';
    process.stdout.write(`\rProgress: ${barStr} ${percentage}%`);
}

async function main() {
    console.log('Starting fake health rating generator...');
    const products = await scrapeProductList();
    if (products.length === 0) {
        console.error('No products found. Exiting.');
        process.exit(1);
    }
    console.log(`Found ${products.length} products.`);
    const detailedProducts = [];
    let count = 0;
    for (const product of products) {
        const details = await scrapeProductDetails(product);
        if (details) {
            const withRatings = createRatings(details);
            detailedProducts.push(withRatings);
        }
        count++;
        showProgress(count, products.length);
        await sleep(500);
    }
    console.log('\nSaving to file...');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(detailedProducts, null, 2));
    console.log('Done. Output written to', OUTPUT_FILE);
}

main();

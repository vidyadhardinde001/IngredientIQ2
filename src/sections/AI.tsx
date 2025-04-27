// sections/AI.tsx

"use client";

import React, { useState } from 'react';

const FoodSearch: React.FC = () => {
  const [foodName, setFoodName] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.REACT_APP_API_KEY;
  const searchEngineId = process.env.REACT_APP_CX;

  const handleSearch = async () => {
    if (!foodName) {
      alert('Please enter a food name.');
      return;
    }

    setError(null);
    setResults([]);

    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
          foodName
        )}&key=${apiKey}&cx=${searchEngineId}`
      );

      if (!response.ok) throw new Error('Error fetching search results.');

      const data = await response.json();
      setResults(data.items || []);
    } catch (err) {
      setError('Error occurred while fetching search results.');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Food Information Search</h1>
      <input
        type="text"
        value={foodName}
        placeholder="Enter food name"
        onChange={(e) => setFoodName(e.target.value)}
        style={{ padding: '10px', marginRight: '10px', width: '300px' }}
      />
      <button onClick={handleSearch} style={{ padding: '10px 15px' }}>
        Search
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Search Results:</h2>
          <ul>
            {results.map((result, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <a href={result.link} target="_blank" rel="noopener noreferrer">
                  {result.title}
                </a>
                <p>{result.snippet}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FoodSearch;

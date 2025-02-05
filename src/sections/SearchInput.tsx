import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

interface Props {
  productName: string;
  setProductName: (value: string) => void;
  fetchFoodByName: () => void;
  fetchFoodByBarcode: () => void;
  fetchIngredients: () => void; // Added for Scan Ingredients button functionality
}

const SearchInput: React.FC<Props> = ({
  productName,
  setProductName,
  fetchFoodByName,
  fetchFoodByBarcode,
  fetchIngredients, // Use for "Scan Ingredients" button
}) => {
  return (
    <div className="flex flex-col items-center w-[92%] gap-4 bg-gray-800 p-6 rounded-lg">
      {/* Search Input */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search for food items..."
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <button 
          onClick={fetchFoodByName} 
          className="absolute right-3 top-2 text-gray-400 hover:text-white"
        >
          {/* Search icon */}
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Scan Buttons */}
      <div className="flex gap-4">
        <button
          onClick={fetchFoodByBarcode}
          className="w-[150px] bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500 transition"
        >
          Scan Barcode
        </button>
        <button
          onClick={fetchIngredients} // Added onClick handler for this button
          className="w-[150px] bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500 transition"
        >
          Scan Ingredients
        </button>
      </div>
    </div>
  );
};

export default SearchInput;

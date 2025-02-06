import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

interface Props {
  barcode: string;
  productName: string;
  setProductName: (value: string) => void;
  setBarcode: (value: string) => void; // Added for barcode input
  fetchFoodByName: () => void;
  fetchFoodByBarcode: () => void;
  fetchIngredients: () => void;
}

const SearchInput: React.FC<Props> = ({
  productName,
  barcode,
  setProductName,
  setBarcode, // Added for barcode input
  fetchFoodByName,
  fetchFoodByBarcode,
  fetchIngredients,
}) => {
  return (
    <div className="flex flex-col w-full md:w-full gap-4 bg-gray-800 rounded-lg p-4">
      {/* Search Input for Product Name */}
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
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Search Input for Barcode */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Enter barcode number..."
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <button
          onClick={fetchFoodByBarcode}
          className="absolute right-3 top-2 text-gray-400 hover:text-white"
        >
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Scan Buttons */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <button
          onClick={fetchFoodByBarcode}
          className="w-full md:w-[150px] bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500 transition"
        >
          Scan Barcode
        </button>
        <button
          onClick={fetchIngredients}
          className="w-full md:w-[150px] bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500 transition"
        >
          Scan Ingredients
        </button>
      </div>
    </div>
  );
};

export default SearchInput;

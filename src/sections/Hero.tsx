"use client";
import { useState } from "react";
import Image from "next/image";
import SearchAndScan from "./SearchInput";

export default function ProductScanner() {
  const [search, setSearch] = useState("");

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-[98%] min-h-[50%] mx-auto bg-gray-300 p-4 rounded-lg shadow-lg">
        <div className="flex justify-end mb-4">
          <div className="flex gap-2">
            <button className="bg-gray-600 text-white px-4 py-2 rounded active:scale-95">Login</button>
            <button className="bg-gray-400 text-black px-4 py-2 rounded active:scale-95">Register</button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Sidebar */}
          <div className="bg-gray-700 text-white p-4 rounded-lg flex flex-col flex-grow">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search for food items..."
                className="w-full p-2 rounded bg-gray-800 text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="absolute right-2 top-2 active:scale-95">🔍</button>
            </div>
            <div className="flex gap-2 mb-4">
              <button className="bg-gray-500 p-2 rounded active:scale-95">Scan Barcode</button>
              <button className="bg-gray-500 p-2 rounded active:scale-95">Scan Ingredients</button>
            </div>
            <div className="flex-grow">Product List</div>
          </div>

          {/* Product Details & Table Section */}
          <div className="col-span-2 flex flex-col gap-4">
            <div className="bg-gray-400 p-4 rounded-lg">
              <div className="flex gap-4">
                <div className="bg-gray-100 p-2 rounded-lg shadow">
                  <Image src="/product-image.png" width={150} height={200} alt="Product" />
                </div>
                <div className="w-full grid grid-cols-2 gap-2">
                  <div>Name of Product: <span className="p-2 border rounded bg-white w-full inline-block">Product Name</span></div>
                  <div>Countries sold in: <span className="p-2 border rounded bg-white w-full inline-block">Country List</span></div>
                  <div>Category: <span className="p-2 border rounded bg-white w-full inline-block">Category</span></div>
                  <div>Threatened Species: <span className="p-2 border rounded bg-white w-full inline-block">Species Info</span></div>
                  <div>Allergens: <span className="p-2 border rounded bg-white w-full inline-block">Allergen Info</span></div>
                  <div>Packaging: <span className="p-2 border rounded bg-white w-full inline-block">Packaging Info</span></div>
                </div>
              </div>
            </div>

            {/* Ingredient Table */}
            <div className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-2">Ingredient</th>
                    <th className="p-2">%</th>
                    <th className="p-2">🌿</th>
                    <th className="p-2">♻️</th>
                    <th className="p-2">Health Concerns</th>
                    <th className="p-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">Matcha</td>
                    <td className="border p-2">50%</td>
                    <td className="border p-2">✅</td>
                    <td className="border p-2">♻️</td>
                    <td className="border p-2">None</td>
                    <td className="border p-2">Green tea powder</td>
                  </tr>
                  {/* Add more rows dynamically */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

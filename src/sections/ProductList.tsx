import React from "react";

interface Props {
  foodDataList: any[];
  setSelectedProduct: (product: any) => void;
}

const ProductList: React.FC<Props> = ({ foodDataList, setSelectedProduct }) => (
  <div className="h-full max-h-screen overflow-y-auto pr-4 border-r border-gray-300 scrollbar-hide bg-gray-800 rounded-lg mt-3">
    <div className="bg-gray-600 p-2 rounded-lg">
      <ul className="divide-y divide-gray-400 m-2">
        {foodDataList.map((product, index) => (
          <li key={index} className="py-2">
            <button
              onClick={() => setSelectedProduct(product)}
              className="w-full text-left px-4 py-2 rounded-lg transition-all hover:bg-gray-700"
            >
              <span className="text-sm font-regular text-white capitalize">
                {product.product_name || "Unnamed Product"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default ProductList;

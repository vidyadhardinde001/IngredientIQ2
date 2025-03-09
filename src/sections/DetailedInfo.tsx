import React, { useState, useEffect } from "react";

interface Props {
  selectedProduct: any;
}

const DetailedInfo: React.FC<Props> = ({ selectedProduct }) => {
  const [visibleRows, setVisibleRows] = useState(5);
  const [healthConcerns, setHealthConcerns] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchHealthData = async () => {
      if (selectedProduct?.ingredients) {
        const concerns: { [key: string]: string } = {};

        for (const ingredient of selectedProduct.ingredients) {
          try {
            const res = await fetch(`/api/product-info/route_table?ingredient=${ingredient.text}`);
            const data = await res.json();
            concerns[ingredient.text] = data.healthConcerns || "No data available";
          } catch (error) {
            concerns[ingredient.text] = "Error fetching data";
          }
        }

        setHealthConcerns(concerns);
      }
    };

    fetchHealthData();
  }, [selectedProduct]);

  return (
    <div className="shadow-lg rounded-lg overflow-hidden bg-white">
      <h2 className="text-xl font-bold text-center p-4 bg-gray-100">Ingredients Information</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2 font-semibold">Ingredient</th>
              <th className="px-4 py-2 font-semibold">Max %</th>
              <th className="px-4 py-2 font-semibold">Vegan</th>
              <th className="px-4 py-2 font-semibold">Vegetarian</th>
              <th className="px-4 py-2 font-semibold">Health Concerns</th>
            </tr>
          </thead>
          <tbody>
            {selectedProduct?.ingredients?.slice(0, visibleRows).map((ingredient: any, index: number) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="px-4 py-2 border">{ingredient.text || "N/A"}</td>
                <td className="px-4 py-2 border">
                  {ingredient.percent_max && !isNaN(Number(ingredient.percent_max))
                    ? `${Number(ingredient.percent_max).toFixed(2)}%`
                    : "N/A"}
                </td>
                <td className="px-4 py-2 border">{ingredient.vegan ? ingredient.vegan.charAt(0).toUpperCase() + ingredient.vegan.slice(1) : "N/A"}</td>
                <td className="px-4 py-2 border">{ingredient.vegetarian ? ingredient.vegetarian.charAt(0).toUpperCase() + ingredient.vegetarian.slice(1) : "N/A"}</td>
                <td className="px-4 py-2 border">
                  {healthConcerns[ingredient.text] || <span className="text-gray-500">Loading...</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedProduct?.ingredients?.length > visibleRows && (
        <div className="text-center p-4">
          <button
            onClick={() => setVisibleRows(visibleRows + 5)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
          >
            View More
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailedInfo;

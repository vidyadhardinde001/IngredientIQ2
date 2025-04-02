import React from "react";

interface Props {
  selectedProduct: {
    image_url?: string;
    product_name?: string;
    countries_tags?: string[];
    categories?: string;
    ecoscore_data?: {
      threatening_ingredients?: string[];
    };
    allergens_tags?: string[];
    packaging_tags?: string[];
  };
}

const ProductDetails: React.FC<Props> = ({ selectedProduct }) => {

  const COUNTRY_MAP: { [key: string]: string } = {
    "germany": "Germany",
    "france": "France",
    "italy": "Italy",
    // Add more country mappings as needed
  };

  const CATEGORY_TRANSLATIONS: { [key: string]: string } = {
    "frühstücke": "Breakfast Foods",
    "getränke": "Beverages",
    "snacks": "Snacks",
    // Add more category translations
  };

  // Helper functions to process data
  const getCountries = () => {
    if (!selectedProduct.countries_tags?.length) return "No country data";
    
    return selectedProduct.countries_tags
      .map(country => {
        const parts = country.split(':');
        const countryKey = parts.length > 1 ? parts[1].toLowerCase() : country.toLowerCase();
        return COUNTRY_MAP[countryKey] || countryKey.charAt(0).toUpperCase() + countryKey.slice(1);
      })
      .join(", ");
  };

  const getCategory = () => {
    if (!selectedProduct.categories) return "Category not specified";
    
    const baseCategory = selectedProduct.categories
      .split(',')
      .shift()
      ?.trim()
      .toLowerCase();

    return CATEGORY_TRANSLATIONS[baseCategory || ''] || 
      baseCategory?.replace(/_/g, " ")
                    .replace(/(^\w|\s\w)/g, m => m.toUpperCase()) || 
      "N/A";
  };

  const getAllergens = () => {
    if (!selectedProduct.allergens_tags?.length) return "No listed allergens";
    
    return selectedProduct.allergens_tags
      .map(allergen => allergen
        .replace(/^en:/, '')
        .replace(/-/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '))
      .join(", ");
  };

  const getPackaging = () => {
    if (!selectedProduct.packaging_tags?.length) return "Packaging info not available";
    
    return selectedProduct.packaging_tags
      .map(p => p.split(':').pop() || p)
      .join(", ")
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getThreatenedSpecies = () => {
    if (!selectedProduct.ecoscore_data?.threatening_ingredients?.length) {
      return "No threatened species impact detected";
    }
    
    return selectedProduct.ecoscore_data.threatening_ingredients
      .join(", ")
      .replace(/_/g, " ")
      .replace(/(^\w|\s\w)/g, m => m.toUpperCase());
  };

  return (
    <div className="bg-gray-800 h-full p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Image */}
        <div className="w-full md:w-1/3 flex items-center justify-center bg-gray-800 h-[300px] rounded-lg">
          {selectedProduct.image_url ? (
            <img
              src={selectedProduct.image_url}
              alt="Product"
              className="w-full h-full object-contain rounded-lg bg-white"
            />
          ) : (
            <p className="text-gray-500">No Image</p>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-white">
              Name of Product:
            </label>
            <textarea
              readOnly
              value={selectedProduct.product_name || "Product Name"}
              className="w-full min-h-[50px] p-2 border rounded-md bg-gray-50 resize-none"
            />
          </div>

          {/* Countries Sold */}
          <div>
            <label className="block text-sm font-medium text-white">
              Countries Sold In:
            </label>
            <textarea
              readOnly
              value={getCountries()}
              className="w-full min-h-[50px] p-2 border rounded-md bg-gray-50 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white">
              Category:
            </label>
            <textarea
              readOnly
              value={getCategory()}
              className="w-full min-h-[50px] p-2 border rounded-md bg-gray-50 resize-none"
            />
          </div>

          {/* Threatened Species */}
          <div>
            <label className="block text-sm font-medium text-white">
              Threatened Species:
            </label>
            <textarea
              readOnly
              value={getThreatenedSpecies()}
              className="w-full min-h-[50px] p-2 border rounded-md bg-gray-50 resize-none"
            />
          </div>

          {/* Allergens */}
          <div>
            <label className="block text-sm font-medium text-white">
              Allergens:
            </label>
            <textarea
              readOnly
              value={getAllergens()}
              className="w-full min-h-[50px] p-2 border rounded-md bg-gray-50 resize-none"
            />
          </div>

          {/* Packaging */}
          <div>
            <label className="block text-sm font-medium text-white">
              Packaging:
            </label>
            <textarea
              readOnly
              value={getPackaging()}
              className="w-full min-h-[50px] p-2 border rounded-md bg-gray-50 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

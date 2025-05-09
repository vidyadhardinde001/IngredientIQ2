// sections/SearchInput.tsx

"use client";
import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import Quagga from "@ericblade/quagga2";

interface Props {
  barcode: string;
  productName: string;
  setProductName: (value: string) => void;
  setBarcode: (value: string) => void;
  fetchFoodByName: () => void;
  fetchFoodByBarcode: () => void;
}

const SearchInput: React.FC<Props> = ({
  productName,
  barcode,
  setProductName,
  setBarcode,
  fetchFoodByName,
  fetchFoodByBarcode,
}) => {
  const [scannerActive, setScannerActive] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.src = reader.result as string;
        image.onload = () => {
          Quagga.decodeSingle(
            {
              src: image.src,
              numOfWorkers: 0,
              decoder: { readers: ["ean_reader", "code_128_reader"] },
            },
            (result) => {
              if (result?.codeResult?.code) {
                setBarcode(result.codeResult.code);
                fetchFoodByBarcode();
              } else {
                alert("Barcode not detected.");
              }
            }
          );
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 bg-gray-800 rounded-lg p-4">
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
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </div>

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
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => setScannerActive(!scannerActive)}
          className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500 transition"
        >
          {scannerActive ? "Stop Scan / Upload" : "Scan or Upload Barcode"}
        </button>
        
        {scannerActive && (
          <>
            <BarcodeScannerComponent
              width={300}
              height={200}
              onUpdate={(err, result) => {
                if (result) {
                  const barcodeText = result.getText();
                  if (barcodeText) {
                    setBarcode(barcodeText);
                    setScannerActive(false);
                    fetchFoodByBarcode();
                  }
                }
              }}
            />

            <label className="w-full bg-gray-600 text-white py-2 text-center rounded-lg hover:bg-gray-500 transition cursor-pointer">
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
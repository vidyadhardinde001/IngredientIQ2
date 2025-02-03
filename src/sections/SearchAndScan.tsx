import React from "react";
import { Box, Button } from "@mui/material";

interface SearchSectionProps {
  barcode: string;
  setBarcode: (value: string) => void;
  fetchFoodByBarcode: () => void;
  productName: string;
  setProductName: (value: string) => void;
  fetchFoodByName: () => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  barcode,
  setBarcode,
  fetchFoodByBarcode,
  productName,
  setProductName,
  fetchFoodByName,
}) => {
  return (
    <Box sx={{ marginBottom: "20px", textAlign: "center" }}>
      <input
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="Enter product barcode"
        style={{ padding: "10px", width: "300px", borderRadius: "4px" }}
      />
      <Button
        variant="contained"
        onClick={fetchFoodByBarcode}
        sx={{ marginLeft: "10px", padding: "10px 20px" }}
      >
        Search by Barcode
      </Button>

      <Box sx={{ marginTop: "20px" }}>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Enter product name"
          style={{ padding: "10px", width: "300px", borderRadius: "4px" }}
        />
        <Button
          variant="contained"
          onClick={fetchFoodByName}
          sx={{ marginLeft: "10px", padding: "10px 20px" }}
        >
          Search by Name
        </Button>
      </Box>
    </Box>
  );
};

export default SearchSection;

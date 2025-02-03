import React from "react";
import { Box, List, ListItem, ListItemText, ListItemButton } from "@mui/material";

interface ProductListProps {
  foodDataList: any[];
  setSelectedProduct: (product: any) => void;
}

const ProductList: React.FC<ProductListProps> = ({ foodDataList, setSelectedProduct }) => {
  return (
    <Box
      sx={{
        maxHeight: "400px",
        overflowY: "auto",
        padding: "10px",
        borderRight: "2px solid #ddd",
      }}
    >
      <List>
        {foodDataList.map((product, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton onClick={() => setSelectedProduct(product)}>
              <ListItemText primary={product.product_name || "Unnamed Product"} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ProductList;

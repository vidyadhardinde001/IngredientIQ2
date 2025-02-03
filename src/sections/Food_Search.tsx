"use client";

import React, { useState } from "react";
import axios from "axios";
import NutriScoreSection from "./Nutriscore";

import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";


ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  ChartTooltip,
  Legend
);

const FoodSearch: React.FC = () => {
  const [barcode, setBarcode] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [foodDataList, setFoodDataList] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFoodByBarcode = async () => {
    setLoading(true);
    setSelectedProduct(null);
    setError("");
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      if (response.data.status === 1 && response.data.product) {
        setSelectedProduct(response.data.product);
      } else {
        setError("Product not found.");
      }
    } catch (err) {
      setError("Failed to fetch data.");
    }
    setLoading(false);
  };

  const fetchFoodByName = async () => {
    setLoading(true);
    setFoodDataList([]);
    setSelectedProduct(null);
    setError("");
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${productName}&search_simple=1&json=1`
      );
      if (response.data.products && response.data.products.length > 0) {
        setFoodDataList(response.data.products);
      } else {
        setError("No products found.");
      }
    } catch (err) {
      setError("Failed to fetch data.");
    }
    setLoading(false);
  };

  const generateChartData = (
    labels: string[],
    values: number[],
    label: string
  ) => ({
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  });

  return (
    <Container sx={{ marginTop: "20px" }}>
      {/* Barcode Search */}
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
      </Box>

      {/* Product Name Search */}
      <Box sx={{ marginBottom: "20px", textAlign: "center" }}>
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

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {/* Product List and Details */}
      {foodDataList.length > 0 && !selectedProduct && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
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
                      <ListItemText
                        primary={product.product_name || "Unnamed Product"}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
          {selectedProduct && (
            <Grid item xs={12} sm={8}>
              <Card>
                <CardContent>
                  <Typography variant="h5">
                    {selectedProduct.product_name || "Product Name"}
                  </Typography>
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.product_name}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      marginTop: "10px",
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ marginTop: "10px" }}
                  >
                    Brand: {selectedProduct.brands || "N/A"}
                  </Typography>
                  <Chip
                    label={`Quantity: ${selectedProduct.quantity || "N/A"}`}
                    color="primary"
                    sx={{ marginTop: "10px" }}
                  />
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {selectedProduct && (
        <Grid container spacing={3} sx={{ marginTop: "20px" }}>
          {/* Nutritional Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Nutritional Breakdown</Typography>
                <Bar
                  data={generateChartData(
                    ["Energy (kcal)", "Fat (g)", "Sugars (g)", "Salt (g)"],
                    [
                      selectedProduct.nutriments?.energy_kcal || 0,
                      selectedProduct.nutriments?.fat || 0,
                      selectedProduct.nutriments?.sugars || 0,
                      selectedProduct.nutriments?.salt || 0,
                    ],
                    "Nutrition Per 100g"
                  )}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* NutriScore Section (Replaced with our new component) */}
          <Grid item xs={12}>
            <NutriScoreSection selectedProduct={selectedProduct} />
          </Grid>

          {/* Ingredients Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Ingredients</Typography>
                {selectedProduct.ingredients &&
                selectedProduct.ingredients.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Ingredient</TableCell>
                          <TableCell>Percentage</TableCell>
                          <TableCell>Vegan</TableCell>
                          <TableCell>Vegetarian</TableCell>
                          <TableCell>Sub Ingredients</TableCell>
                          <TableCell>Palm Oil</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedProduct.ingredients.map(
                          (ingredient, index) => (
                            <TableRow key={index}>
                              <TableCell>{ingredient.text}</TableCell>
                              <TableCell>
                                {ingredient.percent_estimate
                                  ? `${ingredient.percent_estimate}%`
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                {ingredient.vegan ? "Yes" : "No"}
                              </TableCell>
                              <TableCell>
                                {ingredient.vegetarian ? "Yes" : "No"}
                              </TableCell>
                              <TableCell>
                                {ingredient.has_sub_ingredients ? "Yes" : "No"}
                              </TableCell>
                              <TableCell>
                                {ingredient.from_palm_oil ? "Yes" : "No"}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography>No ingredients available.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Information */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Detailed Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  Ingredients:{" "}
                  {selectedProduct.ingredients_text || "Not available"}
                </Typography>
                <Divider sx={{ margin: "10px 0" }} />
                <Typography variant="body1">
                  Allergens:{" "}
                  {selectedProduct.allergens || "No allergens listed."}
                </Typography>
                <Typography variant="body1">
                  Packaging:{" "}
                  {selectedProduct.packaging || "No packaging info available"}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default FoodSearch;

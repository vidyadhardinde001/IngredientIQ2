import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";

interface Props {
  selectedProduct: any;
}

const NutritionalBreakdown: React.FC<Props> = ({ selectedProduct }) => {
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
  );
};

export default NutritionalBreakdown;

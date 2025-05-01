// // /sections/IngrediantsTable.tsx

// import React, { useState, useEffect } from "react";
// import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
// import { getIngredientHealthInfo } from "@/app/api/product-info/fetchIngredientInfo"; // Correct import path

// interface IngredientsTableProps {
//   selectedProduct: any;
// }

// const IngredientsTable: React.FC<IngredientsTableProps> = ({ selectedProduct }) => {
//   const [healthConcerns, setHealthConcerns] = useState<{ [key: string]: string }>({});

//   useEffect(() => {
//     if (selectedProduct && selectedProduct.ingredients) {
//       const fetchHealthData = async () => {
//         let concerns: { [key: string]: string } = {};
//         for (const ingredient of selectedProduct.ingredients) {
//           concerns[ingredient.text] = await getIngredientHealthInfo(ingredient.text);
//         }
//         setHealthConcerns(concerns);
//       };
//       fetchHealthData();
//     }
//   }, [selectedProduct]);

//   if (!selectedProduct || !selectedProduct.ingredients) return null;

//   return (
//     <Card sx={{ marginTop: "20px" }}>
//       <CardContent>
//         <Typography variant="h6">Ingredients</Typography>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Ingredient</TableCell>
//                 <TableCell>Percentage</TableCell>
//                 <TableCell>Vegan</TableCell>
//                 <TableCell>Vegetarian</TableCell>
//                 <TableCell>Sub Ingredients</TableCell>
//                 <TableCell>Palm Oil</TableCell>
//                 <TableCell>Health Concerns</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {selectedProduct.ingredients.map((ingredient: any, index: number) => (
//                 <TableRow key={index}>
//                   <TableCell>{ingredient.text}</TableCell>
//                   <TableCell>{ingredient.percent_estimate ? `${ingredient.percent_estimate}%` : "N/A"}</TableCell>
//                   <TableCell>{ingredient.vegan ? "Yes" : "No"}</TableCell>
//                   <TableCell>{ingredient.vegetarian ? "Yes" : "No"}</TableCell>
//                   <TableCell>{ingredient.has_sub_ingredients ? "Yes" : "No"}</TableCell>
//                   <TableCell>{ingredient.from_palm_oil ? "Yes" : "No"}</TableCell>
//                   <TableCell>{healthConcerns[ingredient.text] || "Loading..."}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </CardContent>
//     </Card>
//   );
// };

// export default IngredientsTable;

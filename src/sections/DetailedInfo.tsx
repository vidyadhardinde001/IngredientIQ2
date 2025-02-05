import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Divider } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Props {
  selectedProduct: any;
}

const DetailedInfo: React.FC<Props> = ({ selectedProduct }) => (
  <Accordion>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6">Detailed Information</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography variant="body1">
        Ingredients: {selectedProduct.ingredients_text || "Not available"}
      </Typography>
      <Divider sx={{ margin: "10px 0" }} />
      <Typography variant="body1">
        Allergens: {selectedProduct.allergens || "No allergens listed."}
      </Typography>
      <Typography variant="body1">
        Packaging: {selectedProduct.packaging || "No packaging info available"}
      </Typography>
    </AccordionDetails>
  </Accordion>
);

export default DetailedInfo;

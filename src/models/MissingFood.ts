import mongoose, { Schema, Document } from "mongoose";

// Define the interface with new fields
interface IMissingFood extends Document {
  name: string;
  category: string;
  brand?: string; // Optional field
  packagingType?: string; // Example: Bottle, Box, Can
  ingredients?: string[]; // List of ingredients
  description: string;
}

const MissingFoodSchema = new Schema<IMissingFood>({
  name: { type: String, required: true },
  category: { type: String, default: "Unknown" },
  brand: { type: String, default: "" }, // Optional field
  packagingType: { type: String, default: "" },
  ingredients: { type: [String], default: [] },
  description: { type: String, default: "User-reported missing food" },
});

const MissingFood = mongoose.models.MissingFood || mongoose.model<IMissingFood>("MissingFood", MissingFoodSchema);

export default MissingFood;

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://adityakhandare8320:YmkOcqqoXkfQXrVR@cluster0.js3vm.mongodb.net/IngredientIQ?retryWrites=true&w=majority";

if (!MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");

export const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        throw new Error("Database connection failed");
    }
};

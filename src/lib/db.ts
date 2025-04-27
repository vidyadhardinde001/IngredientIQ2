// lib/db.ts

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
    var mongoose: {
      conn: any;
      promise: any;
    } | undefined;
  }
  

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB Connected");
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

// Schema Definitions
const HealthConditionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['diabetes', 'heart', 'hypertension', 'allergy', 'other'] 
  },
  subtype: String,
  severity: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe'],
    required: true
  },
  label: { type: String, required: true }
});

const FamilyMemberSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  age: { type: Number, required: true, min: 0, max: 120 },
  weight: { type: Number, min: 0 },
  height: { type: Number, min: 0 },
  conditions: [HealthConditionSchema],
  dietaryPreferences: [String],
  includeInRecommendations: { type: Boolean, default: true },
  avatarColor: { type: String, required: true }
});

const NutritionGoalsSchema = new mongoose.Schema({
  weightManagement: { 
    type: String, 
    enum: ['lose', 'maintain', 'gain'],
    required: true,
    default: 'maintain'
  },
  calorieTarget: { type: Number, min: 0 },
  macronutrients: {
    carbs: { type: Number, min: 0, max: 100 },
    protein: { type: Number, min: 0, max: 100 },
    fats: { type: Number, min: 0, max: 100 }
  }
});

export const ProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 0, max: 120 },
  gender: { type: String, required: true },
  weight: { type: Number, min: 0 },
  height: { type: Number, min: 0 },
  conditions: [HealthConditionSchema],
  dietaryPreferences: [String],
  familyMembers: [FamilyMemberSchema],
  nutritionGoals: NutritionGoalsSchema
}, { timestamps: true });

export const ProfileModel = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

export default {
  connectDB,
  ProfileModel
};
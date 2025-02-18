"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";
import FoodSearch from "@/sections/Food_Search";
import Hero from "@/sections/Hero";
import IngredientScanPage from "@/sections/barcode";
import AI from "@/sections/AI";
import Main from "@/sections/Main";
import Login from "@/sections/Login";
import Test from "@/sections/OpenAITest";

import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // In your Home component's checkAuth function
const checkAuth = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwt.decode(token);
      console.log("Decoded token:", decoded); // Add this
      
      const healthData = {
        healthIssues: (decoded as any)?.healthData?.healthIssues || [],
        allergies: (decoded as any)?.healthData?.allergies || []
      };
      
      console.log("Storing health data:", healthData); // Add this
      localStorage.setItem("userHealthData", JSON.stringify(healthData));
    } catch (error) {
      console.error("Token decoding error:", error);
    }
  }
  setIsAuthenticated(!!token);
};

    checkAuth(); // Immediate check
    window.addEventListener("storage", checkAuth);
    
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userHealthData"); // Clear health data too
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <>
      <Login />
      <FoodSearch />
    </>
  );
}

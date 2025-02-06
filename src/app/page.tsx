"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FoodSearch from "@/sections/Food_Search";
import Hero from "@/sections/Hero";
import IngredientScanPage from "@/sections/barcode";
import AI from "@/sections/AI";
import Main from "@/sections/Main";
import Login from "@/sections/Login";

import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };

    checkAuth(); // Run immediately
    window.addEventListener("storage", checkAuth); // Listen for token changes

    return () => window.removeEventListener("storage", checkAuth); // Cleanup listener
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ Remove token
    setIsAuthenticated(false); // Update local state
    router.push("/login"); // Redirect to login page
  };

  return (
    <>
      <Login />
      <FoodSearch />
    </>
  );
}

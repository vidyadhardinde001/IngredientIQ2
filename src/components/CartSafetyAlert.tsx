"use client";
import React from "react";
import { checkProductSafety } from "@/lib/safetyCheck";

interface CartSafetyAlertProps {
  cartItems: any[];
  profile: any;
}

const CartSafetyAlert: React.FC<CartSafetyAlertProps> = ({ cartItems, profile }) => {
  const allWarnings = cartItems.flatMap(product => 
    checkProductSafety(product, profile)
  );
  const uniqueWarnings = Array.from(new Set(allWarnings));

  if (!uniqueWarnings.length) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
      <h3 className="font-bold mb-2">⚠️ Combined Health Warnings</h3>
      <ul className="list-disc pl-5">
        {uniqueWarnings.map((warning, index) => (
          <li key={index}>{warning}</li>
        ))}
      </ul>
    </div>
  );
};

export default CartSafetyAlert;
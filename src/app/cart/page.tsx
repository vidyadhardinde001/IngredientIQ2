"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import jwt from "jsonwebtoken";
import CartSafetyAlert from "@/components/CartSafetyAlert";

interface Product {
  id: string;
  product_name?: string;
  image_url?: string;
  code?: string;
  categories?: string;
  countries_tags?: string[];
  allergens_tags?: string[];
  packaging_tags?: string[];
  nutriments?: any;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
  }, []);

  const removeFromCart = (productId: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    window.dispatchEvent(new Event("storage"));
  };

  const toggleExpand = (productId: string) => {
    setExpandedItem(expandedItem === productId ? null : productId);
  };

  const formatList = (items?: string[]) => {
    if (!items || items.length === 0) return "Not specified";
    return items
      .map((item) => item.split(":").pop() || item)
      .join(", ")
      .replace(/_/g, " ")
      .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const decoded = jwt.decode(token);
        if (!decoded?.email) return;

        const response = await axios.get(`/api/profile?email=${encodeURIComponent(decoded.email)}`);
        if (response.data.profile) {
          setUserProfile(response.data.profile);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        Your Cart ({cartItems.length})
      </h1>

      {userProfile && <CartSafetyAlert cartItems={cartItems} profile={userProfile} />}

      {cartItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg mb-4">Your cart is empty</p>
          <Link href="/" className="text-blue-500 hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {cartItems.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden">
              {/* Clickable header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(item.id)}
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-16 h-16 object-contain"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">
                    {item.product_name || "Unnamed Product"}
                  </h3>
                  {item.code && (
                    <p className="text-sm text-gray-500">
                      Barcode: {item.code}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(item.id);
                  }}
                  className="text-red-500 hover:text-red-700 px-2 py-1"
                >
                  Remove
                </button>
              </div>

              {/* Expandable details */}
              {expandedItem === item.id && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold">Category:</h4>
                      <p>{formatList(item.categories?.split(","))}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Countries:</h4>
                      <p>{formatList(item.countries_tags)}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Allergens:</h4>
                      <p>{formatList(item.allergens_tags)}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Packaging:</h4>
                      <p>{formatList(item.packaging_tags)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

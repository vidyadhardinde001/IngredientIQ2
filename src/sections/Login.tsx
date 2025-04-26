"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";

const Navbar = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
    };

    // Initial check
    checkAuth();

    // Load cart items
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItemsCount(cart.length);

    // Listen for auth changes
    const handleAuthChange = () => checkAuth();
    window.addEventListener("authChange", handleAuthChange);

    // Listen for cart changes
    const handleCartChange = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItemsCount(updatedCart.length);
    };
    window.addEventListener("storage", handleCartChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("storage", handleCartChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.dispatchEvent(new Event("authChange")); // Trigger auth state update
    router.push("/login");
  };

  const handleCartClick = () => {
    router.push("/cart");
  };

  return (
    <nav className="flex justify-between items-center p-4 w-full bg-white shadow-md">
      <div
        className="text-2xl font-bold text-gray-700 cursor-pointer"
        onClick={() => router.push("/")}
      >
        IngredientIQ
      </div>

      <div className="flex items-center gap-4">
        {/* Cart Icon */}
        <div className="relative group">
          <div
            onClick={handleCartClick}
            className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <FaShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-purple-600" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="absolute hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 bottom-full mb-2 left-1/2 transform -translate-x-1/2">
            View Cart
          </span>
        </div>

        <button
          onClick={() => router.push("/report-missing-food")}
          className="px-4 py-2 text-white bg-green-500 rounded-full shadow-md hover:bg-green-600"
        >
          Add Missing Food
        </button>

        {isAuthenticated ? (
          <>
            <FaUserCircle
              className="w-8 h-8 text-blue-500 hover:text-purple-600 cursor-pointer"
              onClick={() => router.push("/profile")}
            />
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition duration-300 ease-in-out"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

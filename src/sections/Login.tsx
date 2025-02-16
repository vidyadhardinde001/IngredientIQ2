"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Navbar = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in (e.g., using local storage or cookies)
    const token = localStorage.getItem("authToken"); // Replace with a secure auth check
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Clear authentication
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <nav className="flex justify-between items-center p-4 w-full bg-white shadow-md">
      {/* Logo or Branding */}
      <div className="text-2xl font-bold text-gray-700 cursor-pointer" onClick={() => router.push("/")}>
        IngredientIQ
      </div>

      {/* Navigation Links */}
      <div>
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
          >
            Logout
          </button>
        ) : (
            <div className="flex space-x-4">
              <button
    onClick={() => router.push("/profile")}
    className="px-6 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-md 
               hover:from-purple-600 hover:to-blue-500 hover:scale-105 transition-transform duration-300 ease-in-out"
  >
    Profile
  </button>
  <button
    onClick={() => router.push("/login")}
    className="px-6 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-md 
               hover:from-purple-600 hover:to-blue-500 hover:scale-105 transition-transform duration-300 ease-in-out"
  >
    Login
  </button>
  <button
    onClick={() => router.push("/register")}
    className="px-6 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-md 
               hover:from-purple-600 hover:to-blue-500 hover:scale-105 transition-transform duration-300 ease-in-out"
  >
    Register
  </button>
</div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
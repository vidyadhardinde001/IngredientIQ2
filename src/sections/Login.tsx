"use client";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();

  return (
    <nav className="flex justify-between items-center p-4 w-full bg-white shadow-md">
      {/* Logo or Branding */}
      <div className="text-2xl font-bold text-gray-700 cursor-pointer" onClick={() => router.push("/")}>
        IngredientIQ
      </div>

      {/* Navigation Links */}
      <div>
        <button
          onClick={() => router.push("/login")}
          className="mr-4 px-4 py-2 text-blue-600 hover:underline"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/register")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          Register
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        localStorage.removeItem("token"); // Clear token if login failed
        throw new Error(data.error || "Invalid email or password");
      } else {
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("storage")); // Manually trigger an update
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="w-80 p-6 bg-white rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full p-2 border rounded mb-4"
          onChange={handleChange}
        />
        <button className="w-full p-2 bg-blue-600 text-white rounded">Login</button>

        {/* Sign Up Button */}
        <div className="mt-4 text-sm text-center">
          <span>Don&apos;t have an account? </span>
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => router.push("/register")}
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  username: string;
  email: string;
  password: string;
  healthIssues: string[];
  otherHealthIssues: string;
}

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    healthIssues: [],
    otherHealthIssues: "",
  });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      healthIssues: checked
        ? [...prevData.healthIssues, value]
        : prevData.healthIssues.filter((issue) => issue !== value),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allHealthIssues = [
      ...formData.healthIssues,
      ...(formData.otherHealthIssues ? [formData.otherHealthIssues] : []),
    ];

    try {
      const res = await fetch("/api/auth/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          username: formData.username,
          email: formData.email,
          password: formData.password,
          healthIssues: allHealthIssues,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      alert("Registration successful! Redirecting to login...");
      router.push("/login");
    } catch (err: any) {
      alert(err.message || "Registration failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="w-80 p-6 bg-white rounded-lg shadow-md">
        <input
          type="text"
          name="username"
          placeholder="Full Name"
          required
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
          value={formData.username}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
          value={formData.email}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full p-2 border rounded mb-4"
          onChange={handleChange}
          value={formData.password}
        />

        <label className="block font-semibold mb-2">Health Issues:</label>
        <div className="mb-4 space-y-2">
          {["Diabetes", "Allergy", "Heart Disease"].map((issue) => (
            <label key={issue} className="block">
              <input
                type="checkbox"
                value={issue}
                checked={formData.healthIssues.includes(issue)}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              {issue}
            </label>
          ))}
        </div>

        <textarea
          name="otherHealthIssues"
          placeholder="Other health issues (if any)"
          className="w-full p-2 border rounded mb-4"
          onChange={handleChange}
          value={formData.otherHealthIssues}
        />

        <button type="submit" className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700">
          Register
        </button>
      </form>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Profile = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    age: "",
    gender: "",
    healthConditions: "",
    dietaryPreferences: "",
    allergies: "",
    foodSuggestions: [],
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserData(updatedData);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <>
      {/* Background Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose} // Close when clicking outside
        />
      )}

      {/* Sliding Profile Panel */}
      <motion.div
        initial={{ x: "-100%" }} // Start hidden to the left
        animate={{ x: isOpen ? "0%" : "-100%" }} // Slide in when open
        exit={{ x: "-100%" }} // Slide out when closed
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 p-6 overflow-y-auto"
      >
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900 absolute right-4 top-4">
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            value={userData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Your Name"
            required
          />
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Email"
            required
            disabled
          />
          <input
            type="number"
            name="age"
            value={userData.age}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Age"
          />
          <input
            type="text"
            name="gender"
            value={userData.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Gender"
          />
          <textarea
            name="healthConditions"
            value={userData.healthConditions}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Any existing health conditions (e.g., Diabetes, High BP)"
          />
          <textarea
            name="dietaryPreferences"
            value={userData.dietaryPreferences}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Dietary Preferences (e.g., Vegan, Keto)"
          />
          <textarea
            name="allergies"
            value={userData.allergies}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Food Allergies (e.g., Peanuts, Lactose)"
          />
          <button
            type="submit"
            className="w-full p-2 bg-green-600 text-white font-bold rounded hover:bg-green-500 transition"
          >
            Save Profile
          </button>
        </form>

        <h3 className="text-xl font-bold text-gray-700 mt-6">Food Suggestions</h3>
        <ul className="list-disc ml-6 mt-2">
          {userData.foodSuggestions.length > 0 ? (
            userData.foodSuggestions.map((suggestion, index) => (
              <li key={index} className="text-gray-600">{suggestion}</li>
            ))
          ) : (
            <p className="text-gray-500">No suggestions available. Update your profile to get recommendations.</p>
          )}
        </ul>
      </motion.div>
    </>
  );
};

export default Profile;

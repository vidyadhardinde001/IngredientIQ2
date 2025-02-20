"use client";
import { useState, useEffect } from "react";
import {
  FaUser,
  FaWeight,
  FaHeartbeat,
  FaUtensils,
  FaAllergies,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEdit,
  FaSave,
} from "react-icons/fa";

const Profile = () => {
  const [userData, setUserData] = useState({
    username: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    activityLevel: "",
    healthConditions: "",
    dietaryPreferences: "",
    allergies: "",
    knownDeficiencies: "",
    foodSuggestions: [],
    foodWarnings: [],
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setUserData(JSON.parse(savedProfile));
    }
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    localStorage.setItem("userProfile", JSON.stringify(userData));
    setIsEditing(false);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-teal-50 to-white shadow-xl rounded-lg mt-10 border border-gray-300">
      <h2 className="text-4xl font-extrabold text-teal-700 mb-8 text-center">🍏 Your Health Profile</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input type="text" name="username" placeholder="Your Name" value={userData.username} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm" disabled={!isEditing} />
        <input type="number" name="age" placeholder="Age" value={userData.age} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm" disabled={!isEditing} />
        <select name="gender" value={userData.gender} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm" disabled={!isEditing}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input type="number" name="weight" placeholder="Weight (kg)" value={userData.weight} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm" disabled={!isEditing} />
        <input type="number" name="height" placeholder="Height (cm)" value={userData.height} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm" disabled={!isEditing} />
        <textarea name="healthConditions" placeholder="Health Conditions" value={userData.healthConditions} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm" disabled={!isEditing}></textarea>
        <textarea name="dietaryPreferences" placeholder="Dietary Preferences" value={userData.dietaryPreferences} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm" disabled={!isEditing}></textarea>
        <textarea name="allergies" placeholder="Food Allergies" value={userData.allergies} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm" disabled={!isEditing}></textarea>
      </form>
      <div className="mt-6 flex justify-center">
        {isEditing ? (
          <button className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 transition" onClick={handleSaveProfile}>
            <FaSave className="inline-block mr-2" /> Save Profile
          </button>
        ) : (
          <button className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-400 transition" onClick={handleEditProfile}>
            <FaEdit className="inline-block mr-2" /> Edit Profile
          </button>
        )}
      </div>
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-teal-700 flex items-center"><FaCheckCircle className="mr-2" /> Recommended Foods</h3>
        <ul className="list-disc ml-6 mt-2">
          {userData.foodSuggestions.length > 0 ? userData.foodSuggestions.map((item, i) => (
            <li key={i} className="text-gray-600">{item}</li>
          )) : (
            <p className="text-gray-500">Fill out your profile to get recommendations.</p>
          )}
        </ul>
      </div>
      <div className="mt-6 p-6 bg-red-100 rounded-lg shadow-md border border-red-300">
        <h3 className="text-xl font-bold text-red-700 flex items-center"><FaExclamationTriangle className="mr-2" /> ⚠️ Foods to Avoid</h3>
        <ul className="list-disc ml-6 mt-2">
          {userData.foodWarnings.length > 0 ? userData.foodWarnings.map((item, i) => (
            <li key={i} className="text-red-600">{item}</li>
          )) : (
            <p className="text-gray-600">No warnings yet. Provide health details for better accuracy.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
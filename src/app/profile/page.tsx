"use client";
import { useState, useEffect } from "react";
import {
  FaUser, FaWeight, FaHeartbeat, FaUtensils, FaAllergies,
  FaCheckCircle, FaExclamationTriangle, FaEdit, FaSave,
  FaRunning, FaPills, FaWater, FaSmokingBan, FaWineGlassAlt,
  FaBed, FaDna, FaSpinner
} from "react-icons/fa";

interface UserData {
  username: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  bloodType: string;
  bloodPressure: string;
  cholesterol: string;
  glucoseLevel: string;
  bmi: string;
  activityLevel: string;
  exerciseFrequency: string;
  sleepHours: string;
  waterIntake: string;
  smokingStatus: string;
  alcoholConsumption: string;
  medications: string;
  supplements: string;
  healthConditions: string;
  familyHistory: string;
  dietaryPreferences: string;
  allergies: string;
  foodIntolerances: string;
  knownDeficiencies: string;
  foodSuggestions: string[];
  foodWarnings: string[];
}

const Profile = () => {
  const [userData, setUserData] = useState<UserData>({
    username: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    bloodType: "",
    bloodPressure: "",
    cholesterol: "",
    glucoseLevel: "",
    bmi: "",
    activityLevel: "",
    exerciseFrequency: "",
    sleepHours: "",
    waterIntake: "",
    smokingStatus: "",
    alcoholConsumption: "",
    medications: "",
    supplements: "",
    healthConditions: "",
    familyHistory: "",
    dietaryPreferences: "",
    allergies: "",
    foodIntolerances: "",
    knownDeficiencies: "",
    foodSuggestions: [],
    foodWarnings: [],
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastProfileHash, setLastProfileHash] = useState("");

  const getProfileHash = (profile: UserData) => {
    return JSON.stringify({
      age: profile.age,
      weight: profile.weight,
      height: profile.height,
      healthConditions: profile.healthConditions,
      medications: profile.medications,
      allergies: profile.allergies,
      dietaryPreferences: profile.dietaryPreferences,
      knownDeficiencies: profile.knownDeficiencies
    });
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile) as UserData;
        setUserData(parsed);
        setLastProfileHash(getProfileHash(parsed));
      } catch (e) {
        console.error("Error parsing saved profile:", e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateRecommendations = async (profileData: UserData) => {
    if (isGenerating) return;
    
    const requiredFields = ['age', 'weight', 'height'];
    const missingFields = requiredFields.filter(field => !profileData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')} to get recommendations`);
      return;
    }

    const currentHash = getProfileHash(profileData);
    if (currentHash === lastProfileHash && 
        profileData.foodSuggestions?.length && 
        profileData.foodWarnings?.length) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/profile/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.recommendations || !data.warnings) {
        throw new Error("Invalid response format from API");
      }

      const updatedProfile = {
        ...profileData,
        foodSuggestions: data.recommendations,
        foodWarnings: data.warnings
      };
      
      setUserData(updatedProfile);
      setLastProfileHash(currentHash);
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      
    } catch (error) {
      console.error("Error generating recommendations:", error);
      setError(error instanceof Error ? error.message : "Failed to generate recommendations");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear previous recommendations to force regeneration
      const profileToSave = {
        ...userData,
        foodSuggestions: [],
        foodWarnings: []
      };
      
      localStorage.setItem("userProfile", JSON.stringify(profileToSave));
      setIsEditing(false);
      
      await generateRecommendations(profileToSave);
    } catch (e) {
      console.error("Error saving profile:", e);
      setError("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-teal-50 to-blue-50 shadow-2xl rounded-2xl mt-10 border border-gray-200">
      <div className="text-center mb-10">
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 mb-4">
          🏥 Your Comprehensive Health Profile
        </h2>
        <p className="text-gray-600 text-lg">
          Complete your profile for personalized health recommendations
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-teal-700 flex items-center">
            <FaUser className="mr-2" /> Personal Information
          </h3>
          <input
            type="text"
            name="username"
            placeholder="Full Name"
            value={userData.username}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
            disabled={!isEditing}
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={userData.age}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
            disabled={!isEditing}
          />
          <select
            name="gender"
            value={userData.gender}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
            disabled={!isEditing}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        {/* Body Metrics */}
        <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-teal-700 flex items-center">
            <FaWeight className="mr-2" /> Body Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={userData.weight}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={userData.height}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
              <input
                type="number"
                name="bmi"
                value={userData.bmi}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
              <select
                name="bloodType"
                value={userData.bloodType}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
                disabled={!isEditing}
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Health Indicators */}
        <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-teal-700 flex items-center">
            <FaHeartbeat className="mr-2" /> Health Indicators
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure (mmHg)</label>
            <input
              type="text"
              name="bloodPressure"
              placeholder="e.g. 120/80"
              value={userData.bloodPressure}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cholesterol (mg/dL)</label>
            <input
              type="number"
              name="cholesterol"
              value={userData.cholesterol}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Glucose Level (mg/dL)</label>
            <input
              type="number"
              name="glucoseLevel"
              value={userData.glucoseLevel}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Lifestyle */}
        <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-teal-700 flex items-center">
            <FaRunning className="mr-2" /> Lifestyle
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
            <select
              name="activityLevel"
              value={userData.activityLevel}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
            >
              <option value="">Select</option>
              <option value="Sedentary">Sedentary</option>
              <option value="Lightly Active">Lightly Active</option>
              <option value="Moderately Active">Moderately Active</option>
              <option value="Very Active">Very Active</option>
              <option value="Extremely Active">Extremely Active</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Frequency</label>
            <select
              name="exerciseFrequency"
              value={userData.exerciseFrequency}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
            >
              <option value="">Select</option>
              <option value="Never">Never</option>
              <option value="1-2 times/week">1-2 times/week</option>
              <option value="3-4 times/week">3-4 times/week</option>
              <option value="5+ times/week">5+ times/week</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sleep (hours/night)</label>
            <input
              type="number"
              name="sleepHours"
              value={userData.sleepHours}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Water Intake (L/day)</label>
            <input
              type="number"
              step="0.1"
              name="waterIntake"
              value={userData.waterIntake}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Medical Information */}
        <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-teal-700 flex items-center">
            <FaPills className="mr-2" /> Medical Information
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
            <textarea
              name="medications"
              placeholder="List all medications"
              value={userData.medications}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplements</label>
            <textarea
              name="supplements"
              placeholder="List all supplements"
              value={userData.supplements}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Health Conditions</label>
            <textarea
              name="healthConditions"
              placeholder="List any health conditions"
              value={userData.healthConditions}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Family Medical History</label>
            <textarea
              name="familyHistory"
              placeholder="List significant family medical history"
              value={userData.familyHistory}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
              rows={3}
            />
          </div>
        </div>

        {/* Dietary Information */}
        <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-teal-700 flex items-center">
            <FaUtensils className="mr-2" /> Dietary Information
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Preferences</label>
            <textarea
              name="dietaryPreferences"
              placeholder="e.g. Vegetarian, Vegan, Keto, etc."
              value={userData.dietaryPreferences}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Food Allergies</label>
            <textarea
              name="allergies"
              placeholder="List all food allergies"
              value={userData.allergies}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Food Intolerances</label>
            <textarea
              name="foodIntolerances"
              placeholder="List any food intolerances"
              value={userData.foodIntolerances}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Known Nutrient Deficiencies</label>
            <textarea
              name="knownDeficiencies"
              placeholder="List any known deficiencies"
              value={userData.knownDeficiencies}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm"
              disabled={!isEditing}
              rows={3}
            />
          </div>
        </div>
      </form>

      <div className="mt-10 flex justify-center gap-4">
        {isEditing ? (
          <button
            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg flex items-center disabled:opacity-50"
            onClick={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin inline-block mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="inline-block mr-2" />
                Save Profile & Generate Recommendations
              </>
            )}
          </button>
        ) : (
          <button
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg flex items-center"
            onClick={handleEditProfile}
          >
            <FaEdit className="inline-block mr-2" /> Edit Profile
          </button>
        )}
      </div>

      {/* Recommendations Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-br from-teal-100 to-blue-100 rounded-xl shadow-md border border-teal-200">
          <h3 className="text-xl font-bold text-teal-700 flex items-center">
            <FaCheckCircle className="mr-2" /> Recommended Foods & Nutrients
          </h3>
          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-teal-600 text-2xl mr-2" />
              <span>Generating personalized recommendations...</span>
            </div>
          ) : (
            <ul className="list-disc ml-6 mt-4 space-y-2">
              {userData.foodSuggestions?.length > 0 ? (
                userData.foodSuggestions.map((item, i) => (
                  <li key={i} className="text-gray-700">
                    {item}
                  </li>
                ))
              ) : (
                <p className="text-gray-600 mt-2">
                  Complete your profile and save to receive personalized food and nutrient recommendations.
                </p>
              )}
            </ul>
          )}
        </div>

        <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-md border border-red-200">
          <h3 className="text-xl font-bold text-red-700 flex items-center">
            <FaExclamationTriangle className="mr-2" /> Foods & Substances to Avoid
          </h3>
          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-red-600 text-2xl mr-2" />
              <span>Generating safety recommendations...</span>
            </div>
          ) : (
            <ul className="list-disc ml-6 mt-4 space-y-2">
              {userData.foodWarnings?.length > 0 ? (
                userData.foodWarnings.map((item, i) => (
                  <li key={i} className="text-red-600">
                    {item}
                  </li>
                ))
              ) : (
                <p className="text-gray-600 mt-2">
                  Provide your health details and save to get warnings about foods to avoid.
                </p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiCalendar, FiHeart, FiDroplet, FiAlertTriangle, FiSave, FiX, FiPlus, FiMinus } from "react-icons/fi";

const Profile = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [recommendations, setRecommendations] = useState<{
    foodsToEat: string[];
    foodsToAvoid: string[];
    rationale: string;
    isLoading: boolean;
  }>({
    foodsToEat: [],
    foodsToAvoid: [],
    rationale: "",
    isLoading: false
  });

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    healthConditions: "",
    dietaryPreferences: "",
    allergies: "",
    fitnessGoals: "",
    activityLevel: "",
    weeklyCalorieGoal: "",
    macronutrients: {
      protein: "",
      carbs: "",
      fats: ""
    }
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(prev => ({
            ...prev,
            ...data,
            macronutrients: data.macronutrients || {
              protein: "",
              carbs: "",
              fats: ""
            }
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchUserProfile();
      setSaveSuccess(false);
    }
  }, [isOpen, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("macronutrients.")) {
      const field = name.split(".")[1];
      setUserData(prev => ({
        ...prev,
        macronutrients: {
          ...prev.macronutrients,
          [field]: value
        }
      }));
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserData(prev => ({
          ...prev,
          ...updatedData,
          macronutrients: updatedData.macronutrients || prev.macronutrients
        }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setRecommendations(prev => ({ ...prev, isLoading: true }));

    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error("Missing OpenAI API Key in environment variables.");
        return;
      }

      const prompt = `
      Based on the following user profile, provide specific food recommendations:
  
      **Personal Information:**
      - Age: ${userData.age}
      - Gender: ${userData.gender}
      - Height: ${userData.height} cm
      - Weight: ${userData.weight} kg
  
      **Health Information:**
      - Activity Level: ${userData.activityLevel}
      - Fitness Goals: ${userData.fitnessGoals}
      - Health Conditions: ${userData.healthConditions}
      - Allergies: ${userData.allergies}
  
      **Nutrition Preferences:**
      - Dietary Preferences: ${userData.dietaryPreferences}
      - Weekly Calorie Goal: ${userData.weeklyCalorieGoal}
      - Macronutrients: Protein ${userData.macronutrients.protein}g, Carbs ${userData.macronutrients.carbs}g, Fats ${userData.macronutrients.fats}g
  
      Please provide:
      1. A list of 5-7 specific foods to eat regularly (formatted as an array)
      2. A list of 5-7 specific foods to avoid (formatted as an array)
      3. A short (2-3 sentence) rationale explaining the recommendations
  
      Return the response as a JSON object with these keys: foodsToEat, foodsToAvoid, rationale.
      `;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5",
          messages: [{ role: "user", content: prompt }], // Change "system" to "user"
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data);

        const messageContent = data.choices[0]?.message?.content || "{}";
        const result = JSON.parse(messageContent);

        setRecommendations({
          foodsToEat: result.foodsToEat || [],
          foodsToAvoid: result.foodsToAvoid || [],
          rationale: result.rationale || "",
          isLoading: false,
        });
      } else {
        console.error("Error fetching recommendations:", response.statusText);
        setRecommendations(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      setRecommendations(prev => ({ ...prev, isLoading: false }));
    }
  };



  return (
    <AnimatePresence>
      {/* Background Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sliding Profile Panel */}
      {isOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 h-full w-96 bg-gradient-to-b from-white to-gray-50 shadow-xl z-50 overflow-y-auto"
        >
          <div className="sticky top-0 bg-white z-10 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                className={`py-2 px-4 font-medium ${activeTab === "personal" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}
                onClick={() => setActiveTab("personal")}
              >
                Personal
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === "health" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}
                onClick={() => setActiveTab("health")}
              >
                Health
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === "nutrition" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}
                onClick={() => setActiveTab("nutrition")}
              >
                Nutrition
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {activeTab === "personal" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  {/* Personal Information Fields (same as before) */}
                  {/* ... */}
                </motion.div>
              )}

              {activeTab === "health" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  {/* Health Information Fields (same as before) */}
                  {/* ... */}
                </motion.div>
              )}

              {activeTab === "nutrition" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3">
                    <FiDroplet className="text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700">Nutrition Preferences</h3>
                  </div>

                  <div className="space-y-4 pl-8">
                    {/* Nutrition Preferences Fields (same as before) */}
                    {/* ... */}

                    <div className="pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-medium text-gray-700">Personalized Recommendations</h4>
                        <button
                          type="button"
                          onClick={generateRecommendations}
                          disabled={recommendations.isLoading}
                          className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                        >
                          {recommendations.isLoading ? "Generating..." : "Generate"}
                        </button>
                      </div>

                      {recommendations.isLoading ? (
                        <div className="flex justify-center items-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                      ) : (
                        <>
                          {recommendations.foodsToEat.length > 0 && (
                            <div className="mb-6">
                              <div className="flex items-center text-green-600 mb-2">
                                <FiPlus className="mr-2" />
                                <h5 className="font-medium">Foods to Eat</h5>
                              </div>
                              <div className="bg-green-50 p-4 rounded-lg">
                                <ul className="space-y-2">
                                  {recommendations.foodsToEat.map((food, index) => (
                                    <li key={`eat-${index}`} className="flex items-start">
                                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-2"></span>
                                      <span className="text-gray-700">{food}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {recommendations.foodsToAvoid.length > 0 && (
                            <div className="mb-6">
                              <div className="flex items-center text-red-600 mb-2">
                                <FiMinus className="mr-2" />
                                <h5 className="font-medium">Foods to Avoid</h5>
                              </div>
                              <div className="bg-red-50 p-4 rounded-lg">
                                <ul className="space-y-2">
                                  {recommendations.foodsToAvoid.map((food, index) => (
                                    <li key={`avoid-${index}`} className="flex items-start">
                                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-2"></span>
                                      <span className="text-gray-700">{food}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {recommendations.rationale && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h5 className="text-blue-700 font-medium mb-2">Recommendation Rationale</h5>
                              <p className="text-gray-700 text-sm">{recommendations.rationale}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="sticky bottom-0 bg-white pt-4 pb-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 flex justify-center items-center rounded-lg font-bold text-white ${isLoading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
                    } transition-colors`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>


                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-center text-green-600 text-sm"
                  >
                    Profile updated successfully!
                  </motion.div>
                )}
              </div>
              <button
                onClick={generateRecommendations}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                {recommendations.isLoading ? "Generating..." : "Generate Recommendations"}
              </button>

            </form>
          )}
        </motion.div>
      )}
    </AnimatePresence>

  );
};

export default Profile;
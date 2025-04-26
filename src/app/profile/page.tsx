'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiUsers, FiTarget, FiPlus, FiEdit2, FiTrash2, FiChevronRight, FiCheck } from 'react-icons/fi';

type HealthCondition = {
  id: string;
  type: 'diabetes' | 'heart' | 'hypertension' | 'allergy' | 'other';
  subtype?: string;
  severity: 'mild' | 'moderate' | 'severe';
  label: string;
};

type FamilyMember = {
  id: string;
  name: string;
  relationship: string;
  age: number;
  weight?: number;
  height?: number;
  conditions: HealthCondition[];
  dietaryPreferences: string[];
  includeInRecommendations: boolean;
  avatarColor: string;
};

type UserProfile = {
  name: string;
  email: string;
  age: number;
  gender: string;
  weight?: number;
  height?: number;
  conditions: HealthCondition[];
  dietaryPreferences: string[];
  familyMembers: FamilyMember[];
  nutritionGoals: {
    weightManagement: 'lose' | 'maintain' | 'gain';
    calorieTarget?: number;
    macronutrients?: {
      carbs?: number;
      protein?: number;
      fats?: number;
    };
  };
};

const DEFAULT_CONDITIONS: HealthCondition[] = [
  { id: 'diabetes-type1', type: 'diabetes', subtype: 'type1', severity: 'moderate', label: 'Type 1 Diabetes' },
  { id: 'diabetes-type2', type: 'diabetes', subtype: 'type2', severity: 'moderate', label: 'Type 2 Diabetes' },
  { id: 'heart-disease', type: 'heart', severity: 'moderate', label: 'Heart Disease' },
  { id: 'hypertension', type: 'hypertension', severity: 'moderate', label: 'High Blood Pressure' },
  { id: 'peanut-allergy', type: 'allergy', subtype: 'peanuts', severity: 'severe', label: 'Peanut Allergy' },
  { id: 'gluten-allergy', type: 'allergy', subtype: 'gluten', severity: 'moderate', label: 'Gluten Intolerance' },
];

const AVATAR_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ProfessionalProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    age: 0,
    gender: '',
    conditions: [],
    dietaryPreferences: [],
    familyMembers: [],
    nutritionGoals: {
      weightManagement: 'maintain'
    }
  });
  const [activeTab, setActiveTab] = useState<'personal' | 'family' | 'goals'>('personal');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newFamilyMember, setNewFamilyMember] = useState<Omit<FamilyMember, 'id' | 'avatarColor'>>({
    name: '',
    relationship: '',
    age: 0,
    conditions: [],
    dietaryPreferences: [],
    includeInRecommendations: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Utility to get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  // Handle form submissions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Profile saved:', profile);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tab navigation with smooth transitions
  const TabButton = ({ tab, icon: Icon, label }: { tab: typeof activeTab; icon: React.ComponentType; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === tab ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
    >
      <Icon className={`mr-2 ${activeTab === tab ? 'text-indigo-600' : 'text-gray-500'}`} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <div className="sticky top-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Health Profile</h1>
            <nav className="space-y-1">
              <TabButton tab="personal" icon={FiUser} label="Personal Info" />
              <TabButton tab="family" icon={FiUsers} label="Family Members" />
              <TabButton tab="goals" icon={FiTarget} label="Nutrition Goals" />
            </nav>
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <button
                type="submit"
                form="profile-form"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <form id="profile-form" onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="divide-y divide-gray-200">
                <div className="px-6 py-5">
                  <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                  <p className="mt-1 text-sm text-gray-500">This information will be used to personalize your food recommendations.</p>
                </div>
                
                <div className="px-6 py-5 space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        id="age"
                        value={profile.age}
                        onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={profile.gender}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        id="weight"
                        value={profile.weight || ''}
                        onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        name="height"
                        id="height"
                        value={profile.height || ''}
                        onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    {profile.weight && profile.height && (
                      <div className="sm:col-span-2 flex items-end">
                        <div className="w-full bg-gray-50 rounded-md p-3">
                          <p className="text-xs font-medium text-gray-500">YOUR BMI</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {(profile.weight / ((profile.height / 100) ** 2)).toFixed(1)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-5">
                  <h2 className="text-lg font-medium text-gray-900">Health Conditions</h2>
                  <p className="mt-1 text-sm text-gray-500">Select any conditions that affect your dietary needs.</p>
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {DEFAULT_CONDITIONS.map((condition) => {
                      const isActive = profile.conditions.some(c => c.id === condition.id);
                      return (
                        <button
                          key={condition.id}
                          type="button"
                          onClick={() => {
                            setProfile(prev => ({
                              ...prev,
                              conditions: isActive
                                ? prev.conditions.filter(c => c.id !== condition.id)
                                : [...prev.conditions, condition]
                            }));
                          }}
                          className={`flex items-center justify-between px-4 py-2 rounded-md border ${isActive ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 hover:border-gray-400'}`}
                        >
                          <span>{condition.label}</span>
                          {isActive && <FiCheck className="text-indigo-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="px-6 py-5">
                  <h2 className="text-lg font-medium text-gray-900">Dietary Preferences</h2>
                  <p className="mt-1 text-sm text-gray-500">Select your dietary preferences and restrictions.</p>
                  
                  <div className="mt-4 flex flex-wrap gap-3">
                    {['Vegetarian', 'Vegan', 'Keto', 'Low-carb', 'Dairy-free', 'Gluten-free'].map((pref) => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            dietaryPreferences: prev.dietaryPreferences.includes(pref)
                              ? prev.dietaryPreferences.filter(p => p !== pref)
                              : [...prev.dietaryPreferences, pref]
                          }));
                        }}
                        className={`flex items-center px-4 py-2 rounded-md border ${profile.dietaryPreferences.includes(pref) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 hover:border-gray-400'}`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Family Members Tab */}
            {activeTab === 'family' && (
              <div className="divide-y divide-gray-200">
                <div className="px-6 py-5 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Family Members</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Add family members to get personalized recommendations for everyone.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingMember(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiPlus className="mr-2" />
                    Add Family Member
                  </button>
                </div>

                {/* Add Family Member Form */}
                {isAddingMember && (
                  <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-4">New Family Member</h3>
                    
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="member-name" className="block text-sm font-medium text-gray-700">
                          Full name
                        </label>
                        <input
                          type="text"
                          id="member-name"
                          value={newFamilyMember.name}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, name: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">
                          Relationship
                        </label>
                        <select
                          id="relationship"
                          value={newFamilyMember.relationship}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, relationship: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">Select</option>
                          <option value="spouse">Spouse/Partner</option>
                          <option value="child">Child</option>
                          <option value="parent">Parent</option>
                          <option value="sibling">Sibling</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="member-age" className="block text-sm font-medium text-gray-700">
                          Age
                        </label>
                        <input
                          type="number"
                          id="member-age"
                          value={newFamilyMember.age}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, age: Number(e.target.value) })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-4 flex items-end">
                        <div className="flex items-center h-10">
                          <input
                            id="include-in-recommendations"
                            name="include-in-recommendations"
                            type="checkbox"
                            checked={newFamilyMember.includeInRecommendations}
                            onChange={(e) => setNewFamilyMember({ ...newFamilyMember, includeInRecommendations: e.target.checked })}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="include-in-recommendations" className="ml-2 block text-sm text-gray-700">
                            Include in product recommendations
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Health Conditions</h4>
                      <div className="flex flex-wrap gap-2">
                        {DEFAULT_CONDITIONS.map((condition) => (
                          <button
                            key={condition.id}
                            type="button"
                            onClick={() => {
                              setNewFamilyMember(prev => ({
                                ...prev,
                                conditions: prev.conditions.some(c => c.id === condition.id)
                                  ? prev.conditions.filter(c => c.id !== condition.id)
                                  : [...prev.conditions, condition]
                              }));
                            }}
                            className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${newFamilyMember.conditions.some(c => c.id === condition.id) ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                          >
                            {condition.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsAddingMember(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            familyMembers: [
                              ...prev.familyMembers,
                              {
                                ...newFamilyMember,
                                id: `member-${Date.now()}`,
                                avatarColor: AVATAR_COLORS[prev.familyMembers.length % AVATAR_COLORS.length]
                              }
                            ]
                          }));
                          setNewFamilyMember({
                            name: '',
                            relationship: '',
                            age: 0,
                            conditions: [],
                            dietaryPreferences: [],
                            includeInRecommendations: true
                          });
                          setIsAddingMember(false);
                        }}
                        disabled={!newFamilyMember.name || !newFamilyMember.relationship}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Member
                      </button>
                    </div>
                  </div>
                )}

                {/* Family Members List */}
                <div className="px-6 py-5">
                  {profile.familyMembers.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {profile.familyMembers.map((member) => (
                        <li key={member.id} className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div 
                                className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                                style={{ backgroundColor: member.avatarColor }}
                              >
                                {getInitials(member.name)}
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                <p className="text-sm text-gray-500">
                                  {member.relationship} • {member.age} years old
                                </p>
                                {member.conditions.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {member.conditions.map((condition) => (
                                      <span 
                                        key={condition.id}
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                      >
                                        {condition.label}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setNewFamilyMember({
                                    name: member.name,
                                    relationship: member.relationship,
                                    age: member.age,
                                    conditions: member.conditions,
                                    dietaryPreferences: member.dietaryPreferences,
                                    includeInRecommendations: member.includeInRecommendations
                                  });
                                  setProfile(prev => ({
                                    ...prev,
                                    familyMembers: prev.familyMembers.filter(m => m.id !== member.id)
                                  }));
                                  setIsAddingMember(true);
                                }}
                                className="inline-flex items-center p-1.5 border border-gray-300 rounded-full shadow-sm text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setProfile(prev => ({
                                    ...prev,
                                    familyMembers: prev.familyMembers.filter(m => m.id !== member.id)
                                  }));
                                }}
                                className="inline-flex items-center p-1.5 border border-gray-300 rounded-full shadow-sm text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No family members</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by adding a family member to your profile.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Nutrition Goals Tab */}
            {activeTab === 'goals' && (
              <div className="divide-y divide-gray-200">
                <div className="px-6 py-5">
                  <h2 className="text-lg font-medium text-gray-900">Nutrition Goals</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Set your nutrition goals to receive personalized food recommendations.
                  </p>
                </div>

                <div className="px-6 py-5">
                  <div className="space-y-6">
                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700">Weight Management</legend>
                      <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-4">
                        {[
                          { id: 'lose', label: 'Lose Weight' },
                          { id: 'maintain', label: 'Maintain Weight' },
                          { id: 'gain', label: 'Gain Weight' }
                        ].map((option) => (
                          <div key={option.id} className="flex items-center">
                            <input
                              id={option.id}
                              name="weightManagement"
                              type="radio"
                              checked={profile.nutritionGoals.weightManagement === option.id}
                              onChange={() => setProfile(prev => ({
                                ...prev,
                                nutritionGoals: {
                                  ...prev.nutritionGoals,
                                  weightManagement: option.id as 'lose' | 'maintain' | 'gain'
                                }
                              }))}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <label htmlFor={option.id} className="ml-3 block text-sm font-medium text-gray-700">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="calorieTarget" className="block text-sm font-medium text-gray-700">
                          Daily Calorie Target (optional)
                        </label>
                        <input
                          type="number"
                          name="calorieTarget"
                          id="calorieTarget"
                          value={profile.nutritionGoals.calorieTarget || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            nutritionGoals: {
                              ...prev.nutritionGoals,
                              calorieTarget: Number(e.target.value)
                            }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Macronutrient Distribution (optional)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="protein" className="block text-sm font-medium text-gray-700">
                            Protein (%)
                          </label>
                          <input
                            type="number"
                            name="protein"
                            id="protein"
                            value={profile.nutritionGoals.macronutrients?.protein || ''}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              nutritionGoals: {
                                ...prev.nutritionGoals,
                                macronutrients: {
                                  ...prev.nutritionGoals.macronutrients,
                                  protein: Number(e.target.value)
                                }
                              }
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">
                            Carbohydrates (%)
                          </label>
                          <input
                            type="number"
                            name="carbs"
                            id="carbs"
                            value={profile.nutritionGoals.macronutrients?.carbs || ''}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              nutritionGoals: {
                                ...prev.nutritionGoals,
                                macronutrients: {
                                  ...prev.nutritionGoals.macronutrients,
                                  carbs: Number(e.target.value)
                                }
                              }
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label htmlFor="fats" className="block text-sm font-medium text-gray-700">
                            Fats (%)
                          </label>
                          <input
                            type="number"
                            name="fats"
                            id="fats"
                            value={profile.nutritionGoals.macronutrients?.fats || ''}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              nutritionGoals: {
                                ...prev.nutritionGoals,
                                macronutrients: {
                                  ...prev.nutritionGoals.macronutrients,
                                  fats: Number(e.target.value)
                                }
                              }
                            }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
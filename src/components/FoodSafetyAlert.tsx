"use client";
import React from "react";

interface SafetyAlertProps {
  product: any;
  profile: any;
}

const FoodSafetyAlert: React.FC<SafetyAlertProps> = ({ product, profile }) => {
  const checkSafety = () => {
    const warnings: string[] = [];
    const nutriments = product.nutriments || {};
    const allergens = product.allergens_tags?.map((a: string) => a.replace('en:', '').toLowerCase()) || [];
    const ingredients = product.ingredients_text?.toLowerCase() || '';

    // Check main user conditions
    profile.conditions.forEach((condition: any) => {
      // Allergy check
      if (condition.type === 'allergy' && allergens.includes(condition.subtype?.toLowerCase())) {
        warnings.push(`⚠️ You (${profile.name}): ${condition.label} - Contains ${condition.subtype}`);
      }
      
      // Diabetes check (Nutella has ~56g sugar/100g)
      if (condition.type === 'diabetes' && nutriments.sugars_100g > 10) {
        warnings.push(`⚠️ You (${profile.name}): ${condition.label} - High sugar content (${nutriments.sugars_100g}g/100g)`);
      }
      
      // Heart disease check (Nutella has ~11g saturated fat/100g)
      if (condition.type === 'heart' && nutriments['saturated-fat_100g'] > 5) {
        warnings.push(`⚠️ You (${profile.name}): ${condition.label} - High saturated fat (${nutriments['saturated-fat_100g']}g/100g)`);
      }
    });

    // Check family members
    profile.familyMembers.forEach((member: any) => {
      if (!member.includeInRecommendations) return;
      
      member.conditions.forEach((condition: any) => {
        // Allergy check
        if (condition.type === 'allergy' && allergens.includes(condition.subtype?.toLowerCase())) {
          warnings.push(`⚠️ ${member.name} (${member.relationship}): ${condition.label} - Contains ${condition.subtype}`);
        }
        
        // Hypertension check (Nutella has ~0.1g salt/100g)
        if (condition.type === 'hypertension' && nutriments.salt_100g > 1.5) {
          warnings.push(`⚠️ ${member.name} (${member.relationship}): ${condition.label} - High salt content (${nutriments.salt_100g}g/100g)`);
        }
        
        // Diabetes check
        if (condition.type === 'diabetes' && nutriments.sugars_100g > 10) {
          warnings.push(`⚠️ ${member.name} (${member.relationship}): ${condition.label} - High sugar content (${nutriments.sugars_100g}g/100g)`);
        }

        // Heart disease check
        if (condition.type === 'heart' && nutriments['saturated-fat_100g'] > 5) {
          warnings.push(`⚠️ ${member.name} (${member.relationship}): ${condition.label} - High saturated fat (${nutriments['saturated-fat_100g']}g/100g)`);
        }
      });
    });

    return warnings;
  };

  const warnings = checkSafety();

  if (!warnings.length) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
      <h3 className="font-bold mb-2">⚠️ Health Warnings</h3>
      <ul className="list-disc pl-5">
        {warnings.map((warning, index) => (
          <li key={index}>{warning}</li>
        ))}
      </ul>
    </div>
  );
};

export default FoodSafetyAlert;
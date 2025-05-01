"use client";
import React from "react";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

interface HealthCondition {
  type: 'allergy' | 'diabetes' | 'heart' | 'hypertension' | string;
  subtype?: string;
  label: string;
}

interface FamilyMember {
  name: string;
  relationship: string;
  includeInRecommendations: boolean;
  conditions: HealthCondition[];
}

interface UserProfile {
  name: string;
  conditions: HealthCondition[];
  familyMembers: FamilyMember[];
}

interface Product {
  nutriments?: {
    sugars_100g?: number;
    'saturated-fat_100g'?: number;
    salt_100g?: number;
    [key: string]: any;
  };
  allergens_tags?: string[];
  ingredients_text?: string;
  quantity?: string;
  [key: string]: any;
}

interface SafetyAlertProps {
  product: Product;
  profile: UserProfile;
}

const FoodSafetyAlert: React.FC<SafetyAlertProps> = ({ product, profile }) => {
  const generateSafetyWarnings = () => {
    const warnings: {message: string; severity: 'high' | 'medium' | 'low'}[] = [];
    const nutriments = product.nutriments || {};
    const allergens = product.allergens_tags?.map(a => a.replace('en:', '').toLowerCase()) || [];
    const quantity = product.quantity || 'per 100g';

    // Thresholds for nutritional warnings (in grams per 100g)
    const NUTRITION_THRESHOLDS = {
      diabetes: { sugar: 10 },
      heart: { saturatedFat: 5 },
      hypertension: { salt: 1.5 }
    };

    // Helper function to format quantity-aware messages
    const formatMessage = (baseMessage: string, value: number, unit: string = 'g') => {
      return `${baseMessage} (${value}${unit}/${quantity})`;
    };

    // Check for user conditions
    profile.conditions.forEach(condition => {
      switch (condition.type) {
        case 'allergy':
          if (condition.subtype && allergens.includes(condition.subtype.toLowerCase())) {
            warnings.push({
              message: `Contains ${condition.subtype} - not suitable for ${profile.name}'s ${condition.label}`,
              severity: 'high'
            });
          }
          break;
          
        case 'diabetes':
          if (nutriments.sugars_100g) {
            const sugarContent = nutriments.sugars_100g;
            if (sugarContent > NUTRITION_THRESHOLDS.diabetes.sugar * 1.5) {
              warnings.push({
                message: formatMessage(`Very high sugar content - strict avoidance recommended for ${condition.label}`, sugarContent),
                severity: 'high'
              });
            } else if (sugarContent > NUTRITION_THRESHOLDS.diabetes.sugar) {
              warnings.push({
                message: formatMessage(`High sugar content - consume with caution for ${condition.label}`, sugarContent),
                severity: 'medium'
              });
            }
          }
          break;
          
        case 'heart':
          if (nutriments['saturated-fat_100g']) {
            const saturatedFat = nutriments['saturated-fat_100g'];
            if (saturatedFat > NUTRITION_THRESHOLDS.heart.saturatedFat * 1.5) {
              warnings.push({
                message: formatMessage(`Very high saturated fat - strict avoidance recommended for ${condition.label}`, saturatedFat),
                severity: 'high'
              });
            } else if (saturatedFat > NUTRITION_THRESHOLDS.heart.saturatedFat) {
              warnings.push({
                message: formatMessage(`High saturated fat - limit consumption for ${condition.label}`, saturatedFat),
                severity: 'medium'
              });
            }
          }
          break;
          
        case 'hypertension':
          if (nutriments.salt_100g) {
            const saltContent = nutriments.salt_100g;
            if (saltContent > NUTRITION_THRESHOLDS.hypertension.salt * 1.5) {
              warnings.push({
                message: formatMessage(`Very high salt content - strict avoidance recommended for ${condition.label}`, saltContent),
                severity: 'high'
              });
            } else if (saltContent > NUTRITION_THRESHOLDS.hypertension.salt) {
              warnings.push({
                message: formatMessage(`High salt content - limit consumption for ${condition.label}`, saltContent),
                severity: 'medium'
              });
            }
          }
          break;
      }
    });

    // Check family members' conditions
    profile.familyMembers
      .filter(member => member.includeInRecommendations)
      .forEach(member => {
        member.conditions.forEach(condition => {
          switch (condition.type) {
            case 'allergy':
              if (condition.subtype && allergens.includes(condition.subtype.toLowerCase())) {
                warnings.push({
                  message: `Contains ${condition.subtype} - not suitable for ${member.name} (${member.relationship}) with ${condition.label}`,
                  severity: 'high'
                });
              }
              break;
              
            case 'diabetes':
              if (nutriments.sugars_100g) {
                const sugarContent = nutriments.sugars_100g;
                if (sugarContent > NUTRITION_THRESHOLDS.diabetes.sugar * 1.5) {
                  warnings.push({
                    message: formatMessage(`Very high sugar - strict avoidance for ${member.name} (${member.relationship}) with ${condition.label}`, sugarContent),
                    severity: 'high'
                  });
                } else if (sugarContent > NUTRITION_THRESHOLDS.diabetes.sugar) {
                  warnings.push({
                    message: formatMessage(`High sugar - caution for ${member.name} (${member.relationship}) with ${condition.label}`, sugarContent),
                    severity: 'medium'
                  });
                }
              }
              break;
              
            case 'heart':
              if (nutriments['saturated-fat_100g']) {
                const saturatedFat = nutriments['saturated-fat_100g'];
                if (saturatedFat > NUTRITION_THRESHOLDS.heart.saturatedFat * 1.5) {
                  warnings.push({
                    message: formatMessage(`Very high saturated fat - strict avoidance for ${member.name} (${member.relationship}) with ${condition.label}`, saturatedFat),
                    severity: 'high'
                  });
                } else if (saturatedFat > NUTRITION_THRESHOLDS.heart.saturatedFat) {
                  warnings.push({
                    message: formatMessage(`High saturated fat - limit for ${member.name} (${member.relationship}) with ${condition.label}`, saturatedFat),
                    severity: 'medium'
                  });
                }
              }
              break;
              
            case 'hypertension':
              if (nutriments.salt_100g) {
                const saltContent = nutriments.salt_100g;
                if (saltContent > NUTRITION_THRESHOLDS.hypertension.salt * 1.5) {
                  warnings.push({
                    message: formatMessage(`Very high salt - strict avoidance for ${member.name} (${member.relationship}) with ${condition.label}`, saltContent),
                    severity: 'high'
                  });
                } else if (saltContent > NUTRITION_THRESHOLDS.hypertension.salt) {
                  warnings.push({
                    message: formatMessage(`High salt - limit for ${member.name} (${member.relationship}) with ${condition.label}`, saltContent),
                    severity: 'medium'
                  });
                }
              }
              break;
          }
        });
      });

    return warnings;
  };

  const warnings = generateSafetyWarnings();

  if (warnings.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4">
        <div className="flex items-center">
          <FiCheckCircle className="mr-2 text-green-500" />
          <span>This product appears safe for all dietary needs in your profile</span>
        </div>
        {product.quantity && (
          <div className="mt-2 text-sm text-green-600">
            Product quantity: {product.quantity}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <div className="bg-amber-100 border-b border-amber-200 px-4 py-3">
        <div className="flex items-center">
          <FiAlertTriangle className="mr-2 text-amber-600" />
          <h3 className="font-semibold text-amber-800">Dietary Considerations</h3>
        </div>
        {product.quantity && (
          <div className="mt-1 text-xs text-amber-700">
            Product quantity: {product.quantity}
          </div>
        )}
      </div>
      
      <div className="divide-y divide-amber-100">
        {warnings.map((warning, index) => (
          <div 
            key={index} 
            className={`p-4 ${warning.severity === 'high' ? 'bg-red-50' : warning.severity === 'medium' ? 'bg-amber-50' : 'bg-yellow-50'}`}
          >
            <div className="flex items-start">
              <div className={`mt-1 mr-3 flex-shrink-0 w-2 h-2 rounded-full ${
                warning.severity === 'high' ? 'bg-red-500' : 
                warning.severity === 'medium' ? 'bg-amber-500' : 'bg-yellow-500'
              }`}></div>
              <div className="text-sm">
                {warning.message}
                {warning.severity === 'high' && (
                  <div className="mt-1 text-xs font-medium text-red-600">Immediate health risk</div>
                )}
                {warning.severity === 'medium' && (
                  <div className="mt-1 text-xs font-medium text-amber-600">Moderate concern</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodSafetyAlert;
export const checkProductSafety = (product: any, profile: any) => {
    const warnings: string[] = [];
    const nutriments = product.nutriments || {};
    const allergens = product.allergens_tags?.map((a: string) => a.replace('en:', '').toLowerCase()) || [];
  
    // Check user conditions
    profile.conditions.forEach((condition: any) => {
      if (condition.type === 'allergy' && allergens.includes(condition.subtype?.toLowerCase())) {
        warnings.push(`⚠️ You (${profile.name}): ${condition.label} - Contains ${condition.subtype}`);
      }
      if (condition.type === 'diabetes' && nutriments.sugars_100g > 10) {
        warnings.push(`⚠️ You (${profile.name}): ${condition.label} - High sugar (${nutriments.sugars_100g}g/100g)`);
      }
      if (condition.type === 'heart' && nutriments['saturated-fat_100g'] > 5) {
        warnings.push(`⚠️ You (${profile.name}): ${condition.label} - High saturated fat (${nutriments['saturated-fat_100g']}g/100g)`);
      }
    });
  
    // Check family members
    profile.familyMembers.forEach((member: any) => {
      if (!member.includeInRecommendations) return;
      member.conditions.forEach((condition: any) => {
        if (condition.type === 'allergy' && allergens.includes(condition.subtype?.toLowerCase())) {
          warnings.push(`⚠️ ${member.name} (${member.relationship}): ${condition.label} - Contains ${condition.subtype}`);
        }
        if (condition.type === 'hypertension' && nutriments.salt_100g > 1.5) {
          warnings.push(`⚠️ ${member.name} (${member.relationship}): ${condition.label} - High salt (${nutriments.salt_100g}g/100g)`);
        }
        if (condition.type === 'diabetes' && nutriments.sugars_100g > 10) {
          warnings.push(`⚠️ ${member.name} (${member.relationship}): ${condition.label} - High sugar (${nutriments.sugars_100g}g/100g)`);
        }
        if (condition.type === 'heart' && nutriments['saturated-fat_100g'] > 5) {
          warnings.push(`⚠️ ${member.name} (${member.relationship}): ${condition.label} - High saturated fat (${nutriments['saturated-fat_100g']}g/100g)`);
        }
      });
    });
  
    return warnings;
  };
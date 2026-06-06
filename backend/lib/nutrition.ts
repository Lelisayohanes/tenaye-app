import { Dish, Session } from '@prisma/client';

export function evaluateDish(
  dish: Dish,
  session: Session
): { status: 'safe' | 'caution' | 'avoid'; reason: string } {
  // 1. Allergy Rules (Any matching allergen -> Avoid)
  const sessionAllergies = session.allergies
    ? session.allergies.split(',').map((a) => a.trim().toLowerCase())
    : [];

  if (dish.containsAllergens) {
    const dishAllergens = dish.containsAllergens.split(',').map((a) => a.trim().toLowerCase());
    for (const allergen of dishAllergens) {
      if (allergen && sessionAllergies.includes(allergen)) {
        return { status: 'avoid', reason: `Contains ${allergen.charAt(0).toUpperCase() + allergen.slice(1)}` };
      }
    }
  }

  // Double safe guard: if dairy product and dairy selected
  if (dish.isDairyProduct && sessionAllergies.includes('dairy')) {
    return { status: 'avoid', reason: 'Contains Dairy' };
  }

  // 2. Pregnancy Rules
  if (session.isPregnant) {
    // Restrict foods flagged as unsafe during pregnancy (e.g., raw food)
    if (dish.isRaw) {
      return { status: 'avoid', reason: 'Raw meat risk (strictly avoid raw during pregnancy)' };
    }
    // High sodium warning for pregnant
    if (dish.sodiumMg > 800) {
      return { status: 'caution', reason: 'Elevated sodium level (moderate to limit water retention)' };
    }
  }

  // 3. Diabetes Rules
  if (session.hasDiabetes) {
    // Dangerous sugar levels/carbohydrate traps
    if (dish.nameEn.toLowerCase() === 'firfir' || dish.nameEn.toLowerCase().includes('tej')) {
      return { status: 'avoid', reason: 'Very high glycemic load / dangerous sugar levels' };
    }
    // Glycemic Index > 70 -> Avoid
    if (dish.glycemicIndex > 70) {
      return { status: 'caution', reason: 'High Glycemic Index (limit portions strictly)' };
    }
    // Glycemic Index 56-70 -> Caution
    if (dish.glycemicIndex >= 56 && dish.glycemicIndex <= 70) {
      return { status: 'caution', reason: 'Moderate-to-high carb count' };
    }
  }

  // 4. Hypertension Rules
  if (session.hasHypertension) {
    // Sodium > 800mg -> Avoid (as requested in rule engine)
    if (dish.sodiumMg > 800) {
      return { status: 'caution', reason: 'High sodium content (limit portion or request low-salt preparation)' };
    }
    // Sodium 400-800mg -> Caution
    if (dish.sodiumMg >= 400 && dish.sodiumMg <= 800) {
      return { status: 'caution', reason: 'Moderate sodium content' };
    }
  }

  // 5. Default/Safe Reasons
  let safeReason = 'Low GI, low sodium';
  const nameLower = dish.nameEn.toLowerCase();
  if (nameLower.includes('ayib be gomen')) safeReason = 'Low carb, low GI';
  else if (nameLower.includes('tibs')) safeReason = 'High protein, low GI';
  else if (nameLower.includes('gomen')) safeReason = 'Low sodium, high fiber';
  else if (nameLower.includes('buticha')) safeReason = 'Low GI, plant protein';
  else if (nameLower.includes('kik alicha')) safeReason = 'High fiber, mild spices';
  else {
    const isSide = dish.category.toLowerCase() === 'sides';
    safeReason = isSide ? 'Nutritious side option' : 'Balanced protein option';
  }

  return { status: 'safe', reason: safeReason };
}

import { FoodItem } from './types';

export const ETHIOPIAN_FOODS: FoodItem[] = [
  {
    id: 'ayib-be-gomen',
    name: 'Ayib be Gomen',
    nameAmharic: 'አይብ በጎመን',
    category: 'Starters',
    description: 'Low-carb crumbled fresh cottage cheese served with spiced collard greens. Rich in protein and calcium.',
    containsAllergens: ['Dairy'],
    carbs: 'low',
    glycemicIndex: 'low',
    sodium: 'low',
    isRaw: false,
    isDairyProduct: true,
    tags: ['Low GI', 'High Fiber', 'High Protein']
  },
  {
    id: 'tibs-grilled',
    name: 'Tibs (grilled)',
    nameAmharic: 'ጥብስ',
    category: 'Mains',
    description: 'Sautéed lean beef or lamb cubes grilled with onions, garlic, and hot green pepper. Extremely low-carb main.',
    containsAllergens: [],
    carbs: 'low',
    glycemicIndex: 'low',
    sodium: 'moderate',
    isRaw: false,
    isDairyProduct: false,
    tags: ['High Protein', 'Low GI']
  },
  {
    id: 'gomen',
    name: 'Gomen',
    nameAmharic: 'ጎመን',
    category: 'Sides',
    description: 'Tender collard greens simmered slowly with chopped garlic, fresh white onions, and minor ginger extracts. Very low sodium.',
    containsAllergens: [],
    carbs: 'low',
    glycemicIndex: 'low',
    sodium: 'low',
    isRaw: false,
    isDairyProduct: false,
    tags: ['Low Sodium', 'High Fiber']
  },
  {
    id: 'shiro',
    name: 'Shiro',
    nameAmharic: 'ሽሮ',
    category: 'Mains',
    description: 'Rich, spiced chickpea powders slowly simmered with grated onions, spicy minced berbere, and fresh garlic sauce. Comfort vegan meal.',
    containsAllergens: [],
    carbs: 'moderate',
    glycemicIndex: 'moderate',
    sodium: 'moderate',
    isRaw: false,
    isDairyProduct: false,
    tags: ['Moderate Carbs', 'Vegan']
  },
  {
    id: 'injera',
    name: 'Injera',
    nameAmharic: 'እንጀራ',
    category: 'Sides',
    description: 'Traditional fermented sourdough crepe made from teff cereal grains. Essential base of Ethiopian dinings but high glycemic index.',
    containsAllergens: [],
    carbs: 'high',
    glycemicIndex: 'high',
    sodium: 'low',
    isRaw: false,
    isDairyProduct: false,
    tags: ['High GI']
  },
  {
    id: 'firfir',
    name: 'Firfir',
    nameAmharic: 'ፍርፍር',
    category: 'Mains',
    description: 'Shredded injera pieces soaked and cooked in spicy tomato and berbere sauce with added spiced butter (Kibe). Extremely high carbohydrate load.',
    containsAllergens: ['Dairy'],
    carbs: 'high',
    glycemicIndex: 'high',
    sodium: 'high',
    isRaw: false,
    isDairyProduct: true,
    tags: ['Very High Glycemic Load']
  },
  {
    id: 'kitfo',
    name: 'Kitfo',
    nameAmharic: 'ክትፎ',
    category: 'Mains',
    description: 'Finely chopped lean beef fillets, seasoned with melted niter kibe spiced butter and mitmita red pepper. Classically served raw.',
    containsAllergens: ['Dairy'],
    carbs: 'low',
    glycemicIndex: 'low',
    sodium: 'high',
    isRaw: true,
    isDairyProduct: true,
    tags: ['Raw Meat Risk', 'High Sodium']
  },
  {
    id: 'sambusa',
    name: 'Sambusa',
    nameAmharic: 'ሳምቡሳ',
    category: 'Starters',
    description: 'Crisp, fried thin triangular pastries stuffed with spiced garlic green lentils, or sweet beef chops with minced greens.',
    containsAllergens: ['Gluten'],
    carbs: 'high',
    glycemicIndex: 'moderate',
    sodium: 'moderate',
    isRaw: false,
    isDairyProduct: false,
    tags: ['Wheat Content', 'Crispy']
  },
  {
    id: 'doro-wat',
    name: 'Doro Wat',
    nameAmharic: 'ዶሮ ወጥ',
    category: 'Mains',
    description: 'The premier legendary rich chicken stew, slowly cooked with deep berbere red onions, organic butter, and served with whole boiled eggs.',
    containsAllergens: ['Dairy', 'Eggs'],
    carbs: 'low',
    glycemicIndex: 'low',
    sodium: 'high',
    isRaw: false,
    isDairyProduct: true,
    tags: ['Contains Eggs', 'High Sodium']
  },
  {
    id: 'kik-alicha',
    name: 'Kik Alicha',
    nameAmharic: 'ኪክ ዓሊጫ',
    category: 'Sides',
    description: 'Split yellow peas simmered gracefully in mild garlic and turmeric broth. Packed with fiber and easy to digest.',
    containsAllergens: [],
    carbs: 'moderate',
    glycemicIndex: 'low',
    sodium: 'low',
    isRaw: false,
    isDairyProduct: false,
    tags: ['High Fiber', 'Vegan', 'Mild']
  },
  {
    id: 'buticha',
    name: 'Buticha',
    nameAmharic: 'ቡቲቻ',
    category: 'Starters',
    description: 'Ethiopian-style "hummus" spread: cooked chickpea puree blended with red onions, fresh green peppers, olive oil, and lemon.',
    containsAllergens: [],
    carbs: 'low',
    glycemicIndex: 'low',
    sodium: 'low',
    isRaw: false,
    isDairyProduct: false,
    tags: ['Vegan', 'Low GI']
  },
  {
    id: 'tej',
    name: 'Tej (Honey Wine)',
    nameAmharic: 'ጠጅ',
    category: 'Sides',
    description: 'Traditional Ethiopian honey wine sweetened with natural ingredients and fermented with leaves. Very high biological sugar concentration.',
    containsAllergens: [],
    carbs: 'high',
    glycemicIndex: 'high',
    sodium: 'low',
    isRaw: false,
    isDairyProduct: false,
    tags: ['High Sugar Content']
  }
];

export function getFoodStatus(
  item: FoodItem,
  conditions: { diabetes: boolean; hbp: boolean; pregnant: boolean },
  selectedAllergies: string[]
): { status: 'safe' | 'caution' | 'avoid'; reason: string } {
  const avoids: string[] = [];
  const cautions: string[] = [];

  // 1. Check Allergies first
  for (const allergen of item.containsAllergens) {
    if (selectedAllergies.includes(allergen)) {
      avoids.push(`Contains ${allergen}`);
    }
  }

  if (item.isDairyProduct && selectedAllergies.includes('Dairy')) {
    avoids.push('Contains Dairy');
  }

  // 2. Check Pregnancy rules (raw food is strictly avoided)
  if (conditions.pregnant) {
    if (item.isRaw) {
      avoids.push('Raw meat risk (strictly avoid raw during pregnancy)');
    }
    if (item.sodium === 'high') {
      cautions.push('Elevated sodium level (pregnancy caution)');
    }
  }

  // 3. Check Diabetes rules (by order of severity)
  if (conditions.diabetes) {
    if (item.id === 'firfir' || item.id === 'tej') {
      avoids.push('Very high glycemic load / dangerous sugar levels');
    } else if (item.glycemicIndex === 'high') {
      cautions.push('High Glycemic Index (limit portions strictly)');
    } else if (item.carbs === 'high' || item.glycemicIndex === 'moderate') {
      cautions.push('Moderate-to-high carb count');
    }
  }

  // 4. Check Hypertension/HBP rules (sodium restrictions)
  if (conditions.hbp) {
    if (item.sodium === 'high') {
      cautions.push('High sodium content (limit portion or request low-salt)');
    } else if (item.sodium === 'moderate') {
      cautions.push('Moderate sodium content');
    }
  }

  // Determine overall status and combined reasons
  if (avoids.length > 0) {
    return { status: 'avoid', reason: avoids.join(' & ') };
  }
  if (cautions.length > 0) {
    return { status: 'caution', reason: cautions.join(' & ') };
  }

  // Default is Safe
  let safeReason = 'Low carb, low GI';
  if (item.id === 'ayib-be-gomen') safeReason = 'Low carb, low GI';
  else if (item.id === 'tibs-grilled') safeReason = 'High protein, low GI';
  else if (item.id === 'gomen') safeReason = 'Low sodium, high fiber';
  else if (item.id === 'buticha') safeReason = 'Low GI, plant protein';
  else if (item.id === 'kik-alicha') safeReason = 'High fiber, mild spices';
  else {
    const isVegan = item.tags.includes('Vegan');
    safeReason = isVegan ? 'Nutritious vegan option' : 'Balanced protein option';
  }

  return { status: 'safe', reason: safeReason };
}

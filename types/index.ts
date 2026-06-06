export interface HealthConditions {
  diabetes: boolean;
  hbp: boolean;
  pregnant: boolean;
}

export type Category = 'Starters' | 'Mains' | 'Sides';

export interface FoodItem {
  id: string;
  name: string;
  nameAmharic: string;
  category: Category;
  description: string;
  containsAllergens: string[];
  carbs: 'low' | 'moderate' | 'high';
  glycemicIndex: 'low' | 'moderate' | 'high';
  sodium: 'low' | 'moderate' | 'high';
  isRaw: boolean;
  isDairyProduct: boolean;
  tags: string[];
}

export interface SuggestedItem {
  name: string;
  category: string;
  description: string;
  tags: string[];
  iconType: 'leaf' | 'meat' | 'soup' | 'cake' | 'rice' | 'warning';
}

export interface AIRecommendation {
  analysis: string;
  suggestedStarter: SuggestedItem;
  suggestedMain: SuggestedItem;
  reminder: string;
  activeProfileText: string;
}

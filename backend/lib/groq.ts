import { Dish, Session } from '@prisma/client';

export interface GroqRecommendation {
  text: string;
  activeProfileText: string;
  analysis: string;
  suggestedStarter: {
    name: string;
    category: string;
    description: string;
    tags: string[];
    iconType: 'leaf' | 'meat' | 'soup' | 'cake' | 'rice' | 'warning';
  };
  suggestedMain: {
    name: string;
    category: string;
    description: string;
    tags: string[];
    iconType: 'leaf' | 'meat' | 'soup' | 'cake' | 'rice' | 'warning';
  };
  reminder: string;
}

export function getGroqFallback(session: Session, safeDishes: Dish[]): GroqRecommendation {
  // Base default healthy option
  let activeProfileText = "Healthy Balance Menu";
  let analysis = "Based on your clinical selections, a balanced, highly digestible menu is recommended. Start your experience with Buticha to steady initial glucose response, and enjoy Kik Alicha as your main to receive ample fibers and slow-release energy.";
  let starter = {
    name: "Buticha",
    category: "Starters",
    description: "Cold chickpea puree whip with garlic, onions, and jalapeños. Perfect low-GI appetizer.",
    tags: ["Vegan", "Low GI"],
    iconType: "leaf" as const
  };
  let main = {
    name: "Kik Alicha",
    category: "Sides",
    description: "Yellow split pea stew simmered with chopped garlic, onions, turmeric. Highly soluble fibers.",
    tags: ["High Fiber", "Vegan"],
    iconType: "soup" as const
  };
  let reminder = "Remember: Select pure teff Injera to optimize digestion and blood absorption.";

  const allergies = session.allergies ? session.allergies.split(',').map(a => a.trim().toLowerCase()) : [];
  const hasDairy = allergies.includes('dairy');
  const hasGluten = allergies.includes('gluten');

  if (session.hasDiabetes) {
    activeProfileText = "Diabetic Profile Active" + (hasDairy ? " + Dairy Avoidance" : "");
    analysis = "Start your meal with Ayib be Gomen — it's low-carb and gentle on blood sugar. For your main, Tibs (grilled) is your best option today. Avoid the Firfir — its glycemic load is too high for a diabetic profile. Limit injera to one piece if you include it.";
    starter = {
      name: hasDairy ? "Buticha" : "Ayib be Gomen",
      category: "Starters",
      description: hasDairy
        ? "Plant-based chickpea puree whipped with cold water, garlic, and greens. Low GI."
        : "Low-carb starter of crumbled fresh cottage cheese served with collard greens.",
      tags: ["High Fiber", "Low GI"],
      iconType: "leaf" as const
    };
    main = {
      name: "Tibs (grilled)",
      category: "Mains",
      description: "Lean sautéed beef cubes grilled with onions and jalapeños. Stable glucose, high protein.",
      tags: ["High Protein", "Low GI"],
      iconType: "meat" as const
    };
    reminder = "Remember: Limit Injera to 1 piece to maintain optimal glycemic control.";
  } else if (session.hasHypertension) {
    activeProfileText = "Hypertension Profile Active";
    analysis = "Focus on extremely low sodium and high potassium options. Start with Gomen which naturally supports arterial elasticity. For the main, choose mild, slow-simmered Kik Alicha instead of heavily salted meats.";
    starter = {
      name: "Gomen",
      category: "Sides",
      description: "Slow-simmered green collard leaves in virgin olive oil and crushed garlic. Absolutely minimal salt added.",
      tags: ["Low Sodium", "Heart Healthy"],
      iconType: "leaf" as const
    };
    main = {
      name: "Kik Alicha",
      category: "Sides",
      description: "Mild split-pea broth stew lightly infused with natural turmeric. Unsalted, high potassium.",
      tags: ["Sodium Free", "High Fiber"],
      iconType: "soup" as const
    };
    reminder = "Remember: Ask for your meals to be produced completely 'un-salted' to respect arterial goals.";
  } else if (session.isPregnant) {
    activeProfileText = "Gestational Care Active";
    analysis = "Ensure high folate, clean iron, and fully pasteurized, cooked meals. Start with Buticha for plant protein and high natural folate. For your main, choose Tibs (grilled) well-done - make sure it is completely cooked to eliminate food risks.";
    starter = {
      name: "Buticha",
      category: "Starters",
      description: "Creamy chickpea whip served at warm temperature. Fully cooked and safe source of iron and natural folates.",
      tags: ["Folate Source", "Fully Pasteurized"],
      iconType: "soup" as const
    };
    main = {
      name: "Tibs (grilled)",
      category: "Mains",
      description: "Grilled lean steak bites thoroughly cooked to well-done. Zero raw surface risks for embryonic support.",
      tags: ["Well-Done Cooked", "Iron Rich"],
      iconType: "meat" as const
    };
    reminder = "Remember: Strictly avoid raw meat like Kitfo or rare Tibs during gestational weeks.";
  }

  // Adjust for any specific allergy fallback overrides
  if (hasDairy) {
    if (main.name.includes("Butter") || main.name.includes("Kitfo") || main.name.includes("Firfir")) {
      main = {
        name: "Shiro",
        category: "Mains",
        description: "Standard spiced chickpea purees simmered in garlic. Made with canola-vegetable oil, zero butter.",
        tags: ["Dairy Free", "Vegan friendly"],
        iconType: "soup" as const
      };
    }
  }

  return {
    text: `${starter.name} and ${main.name} are suitable choices today. ${analysis} ${reminder}`,
    activeProfileText,
    analysis,
    suggestedStarter: starter,
    suggestedMain: main,
    reminder
  };
}

export async function generateRecommendation(
  session: Session,
  safeDishes: Dish[]
): Promise<GroqRecommendation> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("GROQ_API_KEY not found. Using clinical fallback recommendation.");
    return getGroqFallback(session, safeDishes);
  }

  const conditionsList: string[] = [];
  if (session.hasDiabetes) conditionsList.push("Type 2 Diabetes");
  if (session.hasHypertension) conditionsList.push("High Blood Pressure (Hypertension)");
  if (session.isPregnant) conditionsList.push("Pregnancy (Gestational stage)");

  const allergyList = session.allergies ? session.allergies.split(',').map(a => a.trim()) : [];
  const safeDishNames = safeDishes.map((d) => d.nameEn).join(", ");

  const prompt = `A patient with the following health criteria has requested a safe, curated, and highly specific Ethiopian meal recommendation:
- Health Conditions: ${conditionsList.length > 0 ? conditionsList.join(", ") : "Generally Healthy (No major conditions)"}
- Allergies & Intolerances: ${allergyList.length > 0 ? allergyList.join(", ") : "None disclosed"}
- Safe Dishes available in the restaurant: ${safeDishNames}

Generate personal clinical-dietary advice and select two specific dishes from the safe dishes representing (1) a Starter/Appetizer, and (2) a Main course that fit their constraints perfectly.

Please stick strictly to authentic Ethiopian foods.
Consider these medical restrictions:
- If Diabetic: Strictly avoid carbohydrate traps like "Firfir" and honey meads like "Tej". Suggest limiting "Injera" portion sizes. Recommend "Ayib be Gomen" or "Tibs" as optimal.
- If Hypertension/HBP: Emphasize low sodium. Limit high-butter, high-salt slow stews unless prepared light.
- If Pregnant: Strictly prohibit raw meat ("Kitfo") and ensure all meat dishes are specified as "Well-Done". Recommend high-iron, cooked beans/peas like "Buticha" or "Kik Alicha".
- If Allergens (Gluten, Dairy, Eggs) are present: Exclude foods containing that allergen (e.g. Dairy allergy excludes cottage cheese "Ayib", spiced raw butter "Kibe" inside "Kitfo", "Firfir" or "Doro Wat". Gluten allergy excludes "Sambusa" and normal wheat blends).

Return the response in JSON format. The response must contain:
1. "activeProfileText": A short header describing active conditions (e.g., "Diabetic Profile Active", "Gestational Care & Gluten Avoidance").
2. "analysis": A natural, clinical, supportive 2-3 sentence overview of the recommendation.
3. "suggestedStarter": An object containing the fields: "name" (must be one of the safe starters), "category" (value: "Starters"), "description", "tags" (string array), and "iconType" (must be one of: leaf, meat, soup, cake, rice, warning).
4. "suggestedMain": An object containing the fields: "name" (must be one of the safe mains), "category" (value: "Mains" or "Sides"), "description", "tags" (string array), and "iconType" (must be one of: leaf, meat, soup, cake, rice, warning).
5. "reminder": A 1-sentence warning starting with "Remember:" emphasizing key glycemic, sodium, or gestational guardrails.
6. "text": A concise overview summarizing the advice for standard display.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a professional clinical dietitian specializing in traditional Ethiopian cuisine. Provide objective, precise, structured medical-dietary menu advice.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API returned error status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      return JSON.parse(content.trim()) as GroqRecommendation;
    }
    throw new Error("Empty content in Groq completion response");
  } catch (e) {
    console.error("Groq generation failed, falling back to static logic:", e);
    return getGroqFallback(session, safeDishes);
  }
}

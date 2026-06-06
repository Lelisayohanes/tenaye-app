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
  const allergies = session.allergies ? session.allergies.split(',').map(a => a.trim().toLowerCase()) : [];
  const hasDairy = allergies.includes('dairy');
  const hasGluten = allergies.includes('gluten');

  // Determine active profile description
  const profiles: string[] = [];
  if (session.hasDiabetes) profiles.push("Diabetes Care");
  if (session.hasHypertension) profiles.push("Hypertension Control");
  if (session.isPregnant) profiles.push("Gestational Safety");
  if (hasDairy) profiles.push("Dairy Avoidance");
  if (hasGluten) profiles.push("Gluten Avoidance");

  const activeProfileText = profiles.length > 0 ? `${profiles.join(" + ")} Active` : "Healthy Balance Menu";

  // Base suggestions
  let starter: {
    name: string;
    category: string;
    description: string;
    tags: string[];
    iconType: "leaf" | "meat" | "soup" | "cake" | "rice" | "warning";
  } = {
    name: "Buticha",
    category: "Starters",
    description: "Cold chickpea puree whip with garlic, onions, and jalapeños. Perfect low-GI appetizer.",
    tags: ["Vegan", "Low GI"],
    iconType: "leaf"
  };

  let main: {
    name: string;
    category: string;
    description: string;
    tags: string[];
    iconType: "leaf" | "meat" | "soup" | "cake" | "rice" | "warning";
  } = {
    name: "Kik Alicha",
    category: "Sides",
    description: "Yellow split pea stew simmered with chopped garlic, onions, turmeric. Highly soluble fibers.",
    tags: ["High Fiber", "Vegan"],
    iconType: "soup"
  };

  let analysis = "Based on your clinical selections, a balanced, highly digestible menu is recommended. Start your experience with Buticha to steady initial glucose response, and enjoy Kik Alicha as your main to receive ample fibers and slow-release energy.";
  let reminder = "Remember: Select pure teff Injera to optimize digestion and blood absorption.";

  // Medical Overrides (Combining rules seamlessly)
  if (session.isPregnant) {
    starter = {
      name: "Buticha (Warm)",
      category: "Starters",
      description: "Creamy chickpea whip served at warm temperature. Fully cooked and safe source of iron and natural folates.",
      tags: ["Folate Source", "Fully Pasteurized"],
      iconType: "soup"
    };
    main = {
      name: "Tibs (Well-Done)",
      category: "Mains",
      description: "Grilled lean steak bites thoroughly cooked to well-done. Zero raw surface risks for embryonic support.",
      tags: ["Well-Done Cooked", "Iron Rich"],
      iconType: "meat"
    };
    analysis = "Ensure high folate, clean iron, and fully pasteurized, cooked meals. Warm Buticha provides plant-based protein and folates. Fully cooked well-done Tibs eliminates embryonic hazards.";
    reminder = "Remember: Strictly avoid raw meat like Kitfo or rare Tibs during gestational weeks.";
  }

  if (session.hasDiabetes) {
    if (session.isPregnant) {
      analysis = "Prioritize glycemic control and gestational safety. Enjoy Warm Buticha to cushion insulin rise, and Well-Done Tibs for stable low-carb protein without raw meat risks.";
      reminder = "Remember: Limit Injera portion size and strictly avoid raw beef (Kitfo) or sweet honey Tej.";
    } else {
      starter = {
        name: hasDairy ? "Buticha" : "Ayib be Gomen",
        category: "Starters",
        description: hasDairy 
          ? "Plant-based chickpea puree whipped with cold water, garlic, and greens. Low GI." 
          : "Low-carb starter of fresh cottage cheese mixed with collard greens.",
        tags: ["High Fiber", "Low GI"],
        iconType: "leaf"
      };
      main = {
        name: "Tibs (grilled)",
        category: "Mains",
        description: "Lean sautéed beef cubes with onions and jalapeños. Keeps blood glucose stable and protein absorption high.",
        tags: ["High Protein", "Low GI"],
        iconType: "meat"
      };
      analysis = "To support stable blood sugar, start with Ayib be Gomen (or Buticha if dairy-sensitive) for a low-carb, protein-dense appetizer. For your main, grilled Tibs provides excellent slow-absorption proteins without high glycemic stews.";
      reminder = "Remember: Limit Injera to 1 piece to maintain optimal glycemic control and avoid sweet Tej or carbohydrate-dense stews.";
    }
  }

  if (session.hasHypertension) {
    if (session.hasDiabetes && session.isPregnant) {
      main = {
        name: "Tibs (Well-Done, Un-salted)",
        category: "Mains",
        description: "Grilled lean steak bites cooked thoroughly to well-done with zero added salt to respect arterial health.",
        tags: ["Un-salted", "Well-Done Cooked", "Low GI"],
        iconType: "meat"
      };
      analysis = "Managing pregnancy, diabetes, and blood pressure together requires warm pasteurized starters (Buticha), stable low-GI proteins (Tibs), and requesting completely salt-free preparations.";
      reminder = "Remember: Request your meals completely salt-free and limit Injera portions strictly.";
    } else if (session.hasDiabetes) {
      main = {
        name: "Tibs (grilled, Un-salted)",
        category: "Mains",
        description: "Lean sautéed beef cubes prepared completely without salt. High protein and zero sodium impact.",
        tags: ["Low Sodium", "High Protein", "Low GI"],
        iconType: "meat"
      };
      analysis = "A dual Diabetic + Hypertension profile requires stable, low-carb proteins like grilled Tibs prepared completely unsalted to maintain both arterial and glycemic goals.";
      reminder = "Remember: Request zero salt on entrees and limit Injera to one piece to stabilize glucose.";
    } else if (session.isPregnant) {
      starter = {
        name: "Gomen Extra-Mild",
        category: "Starters",
        description: "Slow-simmered green collard leaves in virgin olive oil and garlic. Cooked, pasteurized, and unsalted.",
        tags: ["Low Sodium", "Heart Healthy", "Gestational safe"],
        iconType: "leaf"
      };
      analysis = "Focus on pasteurized, cooked options with minimal sodium. Start with extra-mild Gomen to support arterial elasticity, and ensure all main dishes are cooked thoroughly with minimal salt.";
      reminder = "Remember: Strictly avoid high-sodium stews, raw meats, and ask for unsalted preparations.";
    } else {
      starter = {
        name: "Gomen Extra-Mild",
        category: "Starters",
        description: "Slow-simmered green collard leaves in virgin olive oil and crushed garlic. Absolutely minimal salt added.",
        tags: ["Low Sodium", "Heart Healthy"],
        iconType: "leaf"
      };
      main = {
        name: "Kik Alicha (Lentils)",
        category: "Sides",
        description: "Mild split-pea broth stew lightly infused with natural turmeric. Unsalted, high potassium.",
        tags: ["Sodium Free", "High Fiber"],
        iconType: "soup"
      };
      analysis = "Focus on extremely low sodium and high potassium options. Mild split-pea Kik Alicha and garlic-infused Gomen support vascular health and blood pressure targets.";
      reminder = "Remember: Ask for your meals to be produced completely 'un-salted' to respect arterial goals.";
    }
  }

  // Adjust for any specific allergy fallback overrides
  if (hasDairy) {
    if (main.name.includes("Butter") || main.name.includes("Kitfo") || main.name.includes("Firfir") || main.name.includes("Wat")) {
      main = {
        name: "Shiro",
        category: "Mains",
        description: "Standard spiced chickpea purees simmered in garlic. Made with canola-vegetable oil, zero butter.",
        tags: ["Dairy Free", "Vegan friendly"],
        iconType: "soup"
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

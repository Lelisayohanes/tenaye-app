import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log("Successfully initialized Gemini API client.");
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
  }
} else {
  console.warn("GEMINI_API_KEY not found in environment. Using smart clinical fallback engine.");
}

// Helper to provide robust fallback recommendations when Gemini key is absent or fails
function getStaticFallback(conditions: { diabetes: boolean; hbp: boolean; pregnant: boolean }, selectedAllergies: string[]) {
  // Base healthy option
  let activeProfileText = "Healthy Balance Menu";
  let analysis = "Based on your clinical selections, a balanced, highly digestible menu is recommended. Start your experience with Buticha to steady initial glucose response, and enjoy Kik Alicha as your main to receive ample fibers and slow-release energy.";
  let starter: any = {
    name: "Buticha",
    category: "Starters",
    description: "Cold chickpea puree whip with garlic, onions, and jalapeños. Perfect low-GI appetizer.",
    tags: ["Vegan", "Low GI"],
    iconType: "leaf" as const
  };
  let main: any = {
    name: "Kik Alicha",
    category: "Mains",
    description: "Yellow split pea stew simmered with chopped garlic, onions, turmeric. Highly soluble fibers.",
    tags: ["High Fiber", "Vegan"],
    iconType: "soup" as const
  };
  let reminder = "Remember: Select pure teff Injera to optimize digestion and blood absorption.";

  // Allergy triggers
  const hasDairyAllergy = selectedAllergies.includes("Dairy");
  const hasGlutenAllergy = selectedAllergies.includes("Gluten");

  if (conditions.diabetes) {
    activeProfileText = "Diabetic Profile Active" + (hasDairyAllergy ? " + Dairy Avoidance" : "");
    analysis = "Start your meal with Ayib be Gomen — it's low-carb and gentle on blood sugar. For your main, Tibs (grilled) is your best option today. Avoid the Firfir — its glycemic load is too high for a diabetic profile. Limit injera to one piece if you include it.";
    
    starter = {
      name: hasDairyAllergy ? "Buticha" : "Ayib be Gomen",
      category: "Starters",
      description: hasDairyAllergy 
        ? "Plant-based chickpea puree whipped with cold water, garlic, and greens. Low GI." 
        : "Low-carb starter of fresh cottage cheese mixed with collard greens.",
      tags: ["High Fiber", "Low GI"],
      iconType: "leaf" as const
    };
    
    main = {
      name: "Tibs (grilled)",
      category: "Mains",
      description: "Lean sautéed beef cubes with onions and jalapeños. Keeps blood glucose stable and protein absorption high.",
      tags: ["High Protein", "Low GI"],
      iconType: "meat" as const
    };
    
    reminder = "Remember: Limit Injera to 1 piece to maintain optimal glycemic control.";
  } else if (conditions.hbp) {
    activeProfileText = "Hyertension Profile Active";
    analysis = "Focus on extremely low sodium and high potassium options. Start with Gomen which naturally supports arterial elasticity. For the main, choose mild, slow-simmered Kik Alicha instead of heavily salted meats.";
    
    starter = {
      name: "Gomen Extra-Mild",
      category: "Starters",
      description: "Slow-simmered green collard leaves in virgin olive oil and crushed garlic. Absolutely minimal salt added.",
      tags: ["Low Sodium", "Heart Healthy"],
      iconType: "leaf" as const
    };
    
    main = {
      name: "Kik Alicha (Lentils)",
      category: "Mains",
      description: "Mild split-pea broth stew lightly infused with natural turmeric. Unsalted, high potassium.",
      tags: ["Sodium Free", "High Fiber"],
      iconType: "soup" as const
    };
    
    reminder = "Remember: Ask for your meals to be produced completely 'un-salted' to respect arterial goals.";
  } else if (conditions.pregnant) {
    activeProfileText = "Gestational Care Active";
    analysis = "Ensure high folate, clean iron, and fully pasteurized, cooked meals. Start with Buticha for plant protein and high natural folate. For your main, choose Tibs (grilled) well-done - make sure it is completely cooked to eliminate food risks.";
    
    starter = {
      name: "Buticha (Warm)",
      category: "Starters",
      description: "Creamy chickpea whip served at warm temperature. Fully cooked and safe source of iron and natural folates.",
      tags: ["Folate Source", "Fully Pasteurized"],
      iconType: "soup" as const
    };
    
    main = {
      name: "Tibs (Well-Done)",
      category: "Mains",
      description: "Grilled lean steak bites thoroughly cooked to well-done. Zero raw surface risks for embryonic support.",
      tags: ["Well-Done Cooked", "Iron Rich"],
      iconType: "meat" as const
    };
    
    reminder = "Remember: Strictly avoid raw meat like Kitfo or rare Tibs during gestational weeks.";
  }

  // Adjust for any specific allergy fallback overrides
  if (hasDairyAllergy && !conditions.diabetes) {
    if (main.name.includes("Butter") || main.name.includes("Kitfo") || main.name.includes("Firfir")) {
      main = {
        name: "Shiro (Claypot)",
        category: "Mains",
        description: "Standard spiced chickpea purees simmered in garlic. Made with canola-vegetable oil, zero butter.",
        tags: ["Dairy Free", "Vegan friendly"],
        iconType: "soup" as const
      };
    }
  }

  return {
    activeProfileText,
    analysis,
    suggestedStarter: starter,
    suggestedMain: main,
    reminder
  };
}

// API Routes
app.post("/api/recommend", async (req, res) => {
  const { healthConditions, selectedAllergies } = req.body;

  if (!healthConditions) {
    return res.status(400).json({ error: "Missing health conditions profile payload." });
  }

  // Assemble conditions for prompt
  const conditionsList: string[] = [];
  if (healthConditions.diabetes) conditionsList.push("Type 2 Diabetes");
  if (healthConditions.hbp) conditionsList.push("High Blood Pressure (Hypertension)");
  if (healthConditions.pregnant) conditionsList.push("Pregnancy (Gestational stage)");

  const allergyList = selectedAllergies || [];

  // Generate dynamic recommendation if Gemini is active
  if (ai) {
    try {
      const prompt = `A patient with the following health criteria has requested a safe, curated, and highly specific Ethiopian meal recommendation:
- Health Conditions: ${conditionsList.length > 0 ? conditionsList.join(", ") : "Generally Healthy (No major conditions)"}
- Allergies & Intolerances: ${allergyList.length > 0 ? allergyList.join(", ") : "None disclosed"}

Generate personal clinical-dietary advice and two specific dishes representing (1) a Starter/Appetizer, and (2) a Main course that fit their constraints perfectly.

Please stick strictly to authentic Ethiopian foods such as: "Ayib be Gomen", "Tibs (grilled)", "Gomen", "Shiro", "Injera", "Firfir", "Kitfo", "Sambusa", "Doro Wat", "Kik Alicha", "Buticha".
Consider these medical restrictions:
- If Diabetic: Strictly avoid carbohydrate traps like "Firfir" and honey meads like "Tej". Suggest limiting "Injera" portion sizes. Recommend "Ayib be Gomen" or "Tibs" as optimal.
- If Hypertension/HBP: Emphasize low sodium. Limit high-butter, high-salt slow stews unless prepared light.
- If Pregnant: Strictly prohibit raw meat ("Kitfo") and ensure all meat dishes are specified as "Well-Done". Recommend high-iron, cooked beans/peas like "Buticha" or "Kik Alicha".
- If Allergens (Gluten, Dairy, Eggs) are present: Exclude foods containing that allergen (e.g. Dairy allergy excludes cottage cheese "Ayib", spiced raw butter "Kibe" inside "Kitfo", "Firfir" or "Doro Wat". Gluten allergy excludes "Sambusa" and normal wheat blends).

Return the structured response.`;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional clinical dietitian specializing in traditional Ethiopian cuisine. Provide objective, precise, structured medical-dietary menu advice.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              activeProfileText: {
                type: Type.STRING,
                description: "A summary line representing active conditions (e.g., 'Diabetic Profile Active', 'Gestational Care & Gluten Avoidance Warning'). Match the UI screenshot formats."
              },
              analysis: {
                type: Type.STRING,
                description: 'A natural, supportive, clinical 2-3 sentence overview of the recommendation. E.g. "Start your meal with Ayib be Gomen — it\'s low-carb and gentle on blood sugar..."'
              },
              suggestedStarter: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING, description: "Must be 'Starters'" },
                  description: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  iconType: { type: Type.STRING, description: "Must be one of: leaf, meat, soup, cake, rice, warning" }
                },
                required: ["name", "category", "description", "tags", "iconType"]
              },
              suggestedMain: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING, description: "Must be 'Mains'" },
                  description: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  iconType: { type: Type.STRING, description: "Must be one of: leaf, meat, soup, cake, rice, warning" }
                },
                required: ["name", "category", "description", "tags", "iconType"]
              },
              reminder: {
                type: Type.STRING,
                description: "A crucial 1-sentence warning starting with 'Remember:' emphasizing key guardrails, e.g., 'Remember: Limit Injera to 1 piece to maintain optimal glycemic control.'"
              }
            },
            required: ["activeProfileText", "analysis", "suggestedStarter", "suggestedMain", "reminder"]
          }
        }
      });

      const responseText = geminiResponse.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json(parsed);
      }
    } catch (e) {
      console.error("Gemini completion failed, falling back to static logic:", e);
    }
  }

  // Fallback if client is null or call failed
  const fallbackData = getStaticFallback(healthConditions, allergyList);
  return res.json(fallbackData);
});

// Setup Vite Dev server / static files path
async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files configuration deployed.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tenaye backend running on port ${PORT}`);
  });
}

init();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
let PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize Groq Client
const API_KEY = process.env.GROQ_API_KEY;

if (API_KEY) {
  console.log("Successfully initialized Groq API client.");
} else {
  console.warn("GROQ_API_KEY not found in environment. Using smart clinical fallback engine.");
}

// Helper to provide robust fallback recommendations when Gemini key is absent or fails
function getStaticFallback(conditions: { diabetes: boolean; hbp: boolean; pregnant: boolean }, selectedAllergies: string[]) {
  const hasDairy = selectedAllergies.includes("Dairy");
  const hasGluten = selectedAllergies.includes("Gluten");

  // Determine active profile description
  const profiles: string[] = [];
  if (conditions.diabetes) profiles.push("Diabetes Care");
  if (conditions.hbp) profiles.push("Hypertension Control");
  if (conditions.pregnant) profiles.push("Gestational Safety");
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
    category: "Mains",
    description: "Yellow split pea stew simmered with chopped garlic, onions, turmeric. Highly soluble fibers.",
    tags: ["High Fiber", "Vegan"],
    iconType: "soup"
  };

  let analysis = "Based on your clinical selections, a balanced, highly digestible menu is recommended. Start your experience with Buticha to steady initial glucose response, and enjoy Kik Alicha as your main to receive ample fibers and slow-release energy.";
  let reminder = "Remember: Select pure teff Injera to optimize digestion and blood absorption.";

  // Medical Overrides (Combining rules seamlessly)
  if (conditions.pregnant) {
    // Pregnancy requires fully cooked food and iron/folate source
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
    analysis = "Ensure high folate, clean iron, and fully pasteurized, cooked meals. Warm Buticha provides plant-based protein and folates. Fully cooked well-done Tibs eliminates embryonic hazards.";
    reminder = "Remember: Strictly avoid raw meat like Kitfo or rare Tibs during gestational weeks.";
  }

  if (conditions.diabetes) {
    // Diabetes requires low GI / low carb
    if (conditions.pregnant) {
      // Combined Pregnant + Diabetic: Starter is warm Buticha (low GI, safe), Main is well-done Tibs (low GI, cooked)
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

  if (conditions.hbp) {
    // Hypertension requires low sodium
    if (conditions.diabetes && conditions.pregnant) {
      main = {
        name: "Tibs (Well-Done, Un-salted)",
        category: "Mains",
        description: "Grilled lean steak bites cooked thoroughly to well-done with zero added salt to respect arterial health.",
        tags: ["Un-salted", "Well-Done Cooked", "Low GI"],
        iconType: "meat"
      };
      analysis = "Managing pregnancy, diabetes, and blood pressure together requires warm pasteurized starters (Buticha), stable low-GI proteins (Tibs), and requesting completely salt-free preparations.";
      reminder = "Remember: Request your meals completely salt-free and limit Injera portions strictly.";
    } else if (conditions.diabetes) {
      main = {
        name: "Tibs (grilled, Un-salted)",
        category: "Mains",
        description: "Lean sautéed beef cubes prepared completely without salt. High protein and zero sodium impact.",
        tags: ["Low Sodium", "High Protein", "Low GI"],
        iconType: "meat"
      };
      analysis = "A dual Diabetic + Hypertension profile requires stable, low-carb proteins like grilled Tibs prepared completely unsalted to maintain both arterial and glycemic goals.";
      reminder = "Remember: Request zero salt on entrees and limit Injera to one piece to stabilize glucose.";
    } else if (conditions.pregnant) {
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
        category: "Mains",
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
        name: "Shiro (Claypot)",
        category: "Mains",
        description: "Standard spiced chickpea purees simmered in garlic. Made with canola-vegetable oil, zero butter.",
        tags: ["Dairy Free", "Vegan friendly"],
        iconType: "soup"
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

  // Generate dynamic recommendation if Groq is active
  if (API_KEY) {
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

Return the response in JSON format matching this schema:
{
  "activeProfileText": "A summary line representing active conditions (e.g., 'Diabetic Profile Active', 'Gestational Care & Gluten Avoidance Warning')",
  "analysis": "A natural, supportive, clinical 2-3 sentence overview of the recommendation.",
  "suggestedStarter": {
    "name": "Dish name (e.g., Ayib be Gomen or Buticha)",
    "category": "Starters",
    "description": "Short appetizing description",
    "tags": ["Tag1", "Tag2"],
    "iconType": "Must be one of: leaf, meat, soup, cake, rice, warning"
  },
  "suggestedMain": {
    "name": "Dish name (e.g., Tibs (grilled))",
    "category": "Mains",
    "description": "Short main course description",
    "tags": ["Tag1", "Tag2"],
    "iconType": "Must be one of: leaf, meat, soup, cake, rice, warning"
  },
  "reminder": "A crucial 1-sentence warning starting with 'Remember:' emphasizing key guardrails, e.g., 'Remember: Limit Injera to 1 piece to maintain optimal glycemic control.'"
}`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
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
        const parsed = JSON.parse(content.trim());
        return res.json(parsed);
      }
    } catch (e) {
      console.error("Groq completion failed, falling back to static logic:", e);
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

  const startServer = (port: number) => {
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`Tenaye backend running on port ${port}`);
    });
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is busy, trying port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error(err);
      }
    });
  };

  startServer(PORT);
}

init();

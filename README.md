# Tenaye (ተናዬ) — AI-Powered Personalized Ethiopian Clinical Directives & Safe Menu Planner

Tenaye (translated to *"My Health"*) represents a modern, clinically-oriented, and culinarily-attuned Ethiopian dietetic assistant. The platform empowers users with diabetes (Type 2), high blood pressure (hypertension), pregnancy, and diverse allergen constraints to filter, understand, and explore traditional Ethiopian dishes safely.

A live, robust server-side backend powered by **Gemini 3.5 Flash** acts as a professional clinical dietitian to analyze critical physiological profiles and formulate bespoke meal combinations with real-time health insights.

---

## 🎨 Design Philosophy & Visual System

Rooted in **Minimalism** and **Functional Clarity**, the Tenaye application adapts a strict "Flat Aesthetic" paired with a highly legibile, reading-centric interface to elevate traditional food choices into scientifically supported health parameters.

- **Primary Colors:** Anchored by a clean, natural **Teal Green** hierarchy (`#00694c`) representing vital biological health, and matched with soft off-whites/grays (`#fcf9f8`) to eliminate clutter and mimic standard clinical-medical layouts.
- **Elevation & Depth:** Eliminates aggressive shadows, gradients, or blur effects. Content grouping is defined entirely via systematic **Tonal Layering** and ultra-thin **0.5px Low-Contrast Outline Borders** (`#bccac1`).
- **Typography:** Set exclusively in **Inter** to ensure maximum cross-platform rendering and visual readability for broad user profiles. Dynamic, comfortable text sizes maintain a solid rhythm, avoiding excessive wrapping on compact mobile displays.
- **Shape Language:**
  - Standard cards and input states use an **8px radius** for a sturdy, professional, grid-aligned structure.
  - Interactive triggers, status pills, and medical category tags use a fully-rounded **20px radius** to isolate non-navigational chips from structural bounds.

---

## 💻 Frontend Client Architecture

The frontend is implemented as a lightning-fast, high-performing Single Page Application using **React**, **Vite**, and **Tailwind CSS**, styled with strict desktop-precision and fluid mobile-responsiveness.

### 1. View Navigation State Model
The user experience is divided into three fluid, high-fidelity responsive screens:
*   **Health Profile Screen (`'profile'`):** Contains robust clinical toggle rows for active medical conditions (Diabetes, Hypertension, Pregnancy/Gestational warning) and an interactive multi-select pill grid representing common allergies and food intolerances (Peanuts, Dairy, Gluten, Eggs, Shellfish, Soy, Tree nuts, Sesame).
*   **Safe Menu Screen (`'menu'`):** A highly organized, searchable interactive listing of local dishes. Features instant, reactive search parsing Amharic or English targets, a live color-coded status legend bar, category filter tabs, and medical reason chips.
*   **AI Recommendation Screen (`'insight'`):** Presents the dynamically generated clinician-dietary brief, structured suggested starter food cards with high-potency green category indicators, main course suggestions, and important caution alert banners.

### 2. State Management & Filtering Engines
The state resides cleanly within a cohesive React controller layer. Key algorithms include:
*   **Logical Clinical Guardian Engine (`getFoodStatus`):** Checks dietary datasets against user configurations to dynamically tag foods into three statuses:
    *   🟢 **Safe (Green):** Low-glycemic, low-sodium, and nutrient-dense combinations.
    *   🟡 **Caution (Amber):** High-glycemic carbs (e.g. standard teff Injera) or elevated sodium properties needing strict portion restrictions.
    *   🔴 **Avoid (Red):** Direct allergy warnings, wheat/gluten triggers, or dangerous systemic food vectors (e.g. raw spiced meat inside *Kitfo* during pregnancy/gestational conditions, or high sugar loads from *Tej* for diabetics).

---

## ⚙️ Backend Integration & API Layer

To protect secret credentials from public exposure, the system uses a secure full-stack layout proxy routing requests through an **Express** helper API.

*   **Endpoint:** `POST /api/recommend`
*   **Payload Schema:**
```json
{
  "healthConditions": {
    "diabetes": true,
    "hbp": false,
    "pregnant": false
  },
  "selectedAllergies": ["Dairy"]
}
```
*   **Gemini 3.5 Flash Integration (Server-Side):**
    Utilizes `@google/genai` to formulate a highly targeted medical prompt. The response is strictly governed by a JSON structural schema configuration, returning formatted active condition text, a multi-sentence nutritional overview, specific starter/main objects with illustrative vector icons, and a bold one-sentence reminder.
*   **Clinical Fallback Engine:**
    If the API key is not yet set up, a sophisticated medical recommendation engine immediately takes over. It produces exact static medical guidance customized per profile to ensure the frontend never receives empty mock responses.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- Recommended: NPM package runner

### Development Setup
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the local development server (Express + Vite on Port 3000):**
    ```bash
    npm run dev
    ```
3.  **Compile the production build:**
    ```bash
    npm run build
    ```
    *(Bundles client assets and compiles the ES typescript backend into `dist/server.cjs` for high-speed delivery.)*
4.  **Run the standalone production server:**
    ```bash
    npm run start
    ```

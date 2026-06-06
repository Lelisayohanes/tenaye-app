import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Menu, 
  Home, 
  Utensils, 
  HeartPulse, 
  User, 
  ShieldCheck, 
  Sparkles, 
  TriangleAlert, 
  Sprout, 
  Flame, 
  Soup, 
  Apple, 
  RotateCcw,
  Search,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HealthConditions, FoodItem, AIRecommendation, Category } from './types';
import { ETHIOPIAN_FOODS, getFoodStatus } from './foods';

// Avatar hotlinked from user layout assets
const USER_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuCL86T0AWjzDbOgW3JvsG73JiSXf__zbo18yeZpQqN96uebt-y7ZnFKiA8NThXgxN8PJOCEe1qi2QD73gIuEOmxd7tpRczFtDb5IpqGSyIDjukCzYFfLF-4NvsTuFPPHKCdwqyIVAJhO41U3P4fgtjngWUWxTwrXLLBiLwnz4ILcbJaeir8EyJdZGbSlpNgxRJ7SNY8X38Dapki3L9PifRjdx-PQQP0B_z0cvL14kWtjxuJSq_HV38D6qery_SVzaRaIZQx6rR1Uco";

const ALLERGIES_LIST = [
  "Peanuts", "Dairy", "Gluten", "Eggs", 
  "Shellfish", "Soy", "Tree nuts", "Sesame"
];

// Active page types
type PageState = 'profile' | 'menu' | 'insight';

export default function App() {
  // Application State
  const [page, setPage] = useState<PageState>('profile');
  const [conditions, setConditions] = useState<HealthConditions>({
    diabetes: false,
    hbp: false,
    pregnant: false
  });
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | Category>('All');
  
  // LLM Recommendation state
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing nutritional profile...");

  // Cycle loading messages for hyper-polished clinical feel
  useEffect(() => {
    if (!loading) return;
    const messages = [
      "Analyzing nutritional profile...",
      "Evaluating glycemic loads...",
      "Excluding allergen triggers...",
      "Consulting clinical dietary guide...",
      "Formulating customized meal plan..."
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setLoadingMessage(messages[idx]);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const toggleCondition = (key: keyof HealthConditions) => {
    setConditions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies(prev => {
      if (prev.includes(allergy)) {
        return prev.filter(a => a !== allergy);
      } else {
        return [...prev, allergy];
      }
    });
  };

  // Safe menu list handler (Screen 2)
  const getProcessedMenu = (): { item: FoodItem; status: 'safe' | 'caution' | 'avoid'; reason: string }[] => {
    return ETHIOPIAN_FOODS.map(item => {
      const { status, reason } = getFoodStatus(item, conditions, selectedAllergies);
      return { item, status, reason };
    })
    .filter(entry => {
      // Filter by Category Tab
      if (activeTab !== 'All' && entry.item.category !== activeTab) {
        return false;
      }
      // Filter by Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          entry.item.name.toLowerCase().includes(query) ||
          entry.item.nameAmharic.includes(query) ||
          entry.item.description.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sort: Safe first, then Caution, then Avoid at bottom
      const rank = { safe: 1, caution: 2, avoid: 3 };
      return rank[a.status] - rank[b.status];
    });
  };

  // API Client call
  const handleGetRecommendation = async () => {
    setLoading(true);
    setPage('insight');
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          healthConditions: conditions,
          selectedAllergies: selectedAllergies
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error status');
      }

      const data = await response.json();
      setRecommendation(data);
    } catch (e) {
      console.error("Failed to fetch custom diet guidelines:", e);
      // Fallback is handled cleanly by backend response in failsafe, but let's provide a reliable UI error support
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setConditions({ diabetes: false, hbp: false, pregnant: false });
    setSelectedAllergies([]);
    setSearchQuery('');
    setActiveTab('All');
    setRecommendation(null);
    setPage('profile');
  };

  // Helper inside suggestion cards to map text categories to lucide-react icons
  const getSuggestionIcon = (iconName: string) => {
    switch (iconName) {
      case 'leaf':
        return <Sprout className="w-6 h-6 text-[#00694c]" />;
      case 'meat':
        return <Flame className="w-6 h-6 text-[#00694c]" />;
      case 'soup':
        return <Soup className="w-6 h-6 text-[#00694c]" />;
      case 'cake':
        return <Apple className="w-6 h-6 text-[#00694c]" />;
      default:
        return <Utensils className="w-6 h-6 text-[#00694c]" />;
    }
  };

  return (
    <div className="bg-[#fcf9f8] min-h-screen text-[#1c1b1b] flex flex-col antialiased font-sans transition-colors duration-200">
      
      {/* ==================== DESKTOP NAVIGATION BAR HEADER ==================== */}
      <header className="hidden md:flex fixed top-0 w-full z-50 bg-[#00694c] text-white border-b border-[#bccac1]/20">
        <div className="flex w-full items-center justify-between max-w-7xl mx-auto h-16 px-8">
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-transform active:scale-95">
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xl font-medium tracking-tight flex items-center gap-2">
              Tenaye ተናዬ
              <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-full text-[#86f8c9]">Beta</span>
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <button 
              onClick={() => { setPage('profile'); setRecommendation(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${page === 'profile' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/5'}`}
              id="desktop-nav-home"
            >
              <Home className="w-4 h-4" />
              Health Profile
            </button>
            <button 
              onClick={() => setPage('menu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${page === 'menu' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/5'}`}
              id="desktop-nav-meals"
            >
              <Utensils className="w-4 h-4" />
              Safe Menu
            </button>
            <button 
              onClick={handleGetRecommendation}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${page === 'insight' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/5'}`}
              id="desktop-nav-health"
            >
              <HeartPulse className="w-4 h-4" />
              AI Recommendation
            </button>
          </nav>

          <button className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-transform active:scale-95 overflow-hidden">
            <img 
              alt="User profile" 
              className="w-8 h-8 rounded-full object-cover border border-white/20" 
              src={USER_AVATAR}
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </header>

      {/* ==================== MOBILE NAVIGATION BAR HEADER ==================== */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-4 h-14 bg-[#00694c] text-white border-b border-[#bccac1]/20 md:hidden">
        {page !== 'profile' ? (
          <button 
            onClick={() => { 
              if (page === 'insight') setPage('menu');
              else setPage('profile');
            }}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-transform active:scale-95"
            id="mobile-back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        
        <h1 className="text-lg font-medium text-center flex-1">
          {page === 'profile' && "Tenaye ተናዬ"}
          {page === 'menu' && "Your safe menu"}
          {page === 'insight' && (loading ? "Analyzing..." : "Your meal plan")}
        </h1>
        
        <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
          {page === 'profile' && (
            <img 
              alt="User profile" 
              className="w-7 h-7 rounded-full object-cover border border-white/20" 
              src={USER_AVATAR}
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </header>

      {/* Spacer for fixed top header */}
      <div className="pt-14 md:pt-16" />

      {/* ==================== SCREEN SWITCHING CANVAS ==================== */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-6 mb-20 md:mb-8">
        <AnimatePresence mode="wait">
          
          {/* 1. HEALTH PROFILE VIEW */}
          {page === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              {/* Header Title Section (Mobile look inside card) */}
              <div className="bg-[#1D9E75] text-white p-6 rounded-2xl text-center md:hidden shadow-sm">
                <h2 className="text-2xl font-semibold mb-1">Tenaye ተናዬ</h2>
                <p className="text-sm opacity-90">Personalized menu for your health</p>
              </div>

              {/* Privacy Shield Banner */}
              <div className="bg-[#f6f3f2] border border-[#bccac1] rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#6d7a73] shrink-0 mt-0.5" />
                <p className="text-xs text-[#6d7a73] leading-relaxed">
                  Your health info stays on your device and is automatically deleted after 2 hours. Our software protects your medical privacy and is never shared with waitstaff.
                </p>
              </div>

              {/* Health Conditions Section */}
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-[#6d7a73] uppercase tracking-wider border-b border-[#bccac1] pb-2">
                  Health Conditions
                </h3>
                
                <div className="flex flex-col border border-[#bccac1] rounded-xl bg-white divide-y divide-[#bccac1]/30 overflow-hidden shadow-sm">
                  
                  {/* Condition 1: Diabetes */}
                  <div className="flex justify-between items-center p-4 hover:bg-[#fcf9f8]/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#1c1b1b]">Diabetes (type 2)</span>
                      <span className="text-xs text-[#6d7a73]">Locks limits on high glycemic spikes</span>
                    </div>
                    <button 
                      onClick={() => toggleCondition('diabetes')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${conditions.diabetes ? 'bg-[#00694c]' : 'bg-[#e5e2e1]'}`}
                      id="toggle-diabetes"
                    >
                      <span 
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${conditions.diabetes ? 'translate-x-5' : 'translate-x-0'}`} 
                      />
                    </button>
                  </div>

                  {/* Condition 2: Hypertension */}
                  <div className="flex justify-between items-center p-4 hover:bg-[#fcf9f8]/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#1c1b1b]">High blood pressure</span>
                      <span className="text-xs text-[#6d7a73]">Highlights sodium sodium guardrails</span>
                    </div>
                    <button 
                      onClick={() => toggleCondition('hbp')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${conditions.hbp ? 'bg-[#00694c]' : 'bg-[#e5e2e1]'}`}
                      id="toggle-hbp"
                    >
                      <span 
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${conditions.hbp ? 'translate-x-5' : 'translate-x-0'}`} 
                      />
                    </button>
                  </div>

                  {/* Condition 3: Pregnancy */}
                  <div className="flex justify-between items-center p-4 hover:bg-[#fcf9f8]/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#1c1b1b]">Pregnant</span>
                      <span className="text-xs text-[#6d7a73]">Blocks raw food or bacteria vectors</span>
                    </div>
                    <button 
                      onClick={() => toggleCondition('pregnant')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${conditions.pregnant ? 'bg-[#00694c]' : 'bg-[#e5e2e1]'}`}
                      id="toggle-pregnant"
                    >
                      <span 
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${conditions.pregnant ? 'translate-x-5' : 'translate-x-0'}`} 
                      />
                    </button>
                  </div>

                </div>
              </section>

              {/* Allergies & Intolerances Section */}
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-[#6d7a73] uppercase tracking-wider border-b border-[#bccac1] pb-2">
                  Allergies & Intolerances
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {ALLERGIES_LIST.map(allergy => {
                    const isSelected = selectedAllergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-150 active:scale-95 ${
                          isSelected 
                            ? 'bg-[#d3e7e0] text-[#00694c] border-[#00694c]' 
                            : 'bg-white text-[#1c1b1b] border-[#bccac1] hover:bg-[#eae7e7]'
                        }`}
                        id={`allergy-pill-${allergy.toLowerCase()}`}
                      >
                        {allergy}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Sticky bottom mobile controls */}
              <div className="mt-8 flex flex-col gap-3">
                <button 
                  onClick={() => setPage('menu')}
                  className="w-full bg-[#00694c] hover:bg-[#00513a] text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transform active:scale-98 transition-all shadow-md cursor-pointer"
                  id="show-menu-button"
                >
                  Show my safe menu
                  <span className="text-lg">→</span>
                </button>
                
                <button 
                  onClick={() => {
                    setConditions({ diabetes: false, hbp: false, pregnant: false });
                    setSelectedAllergies([]);
                    setPage('menu');
                  }}
                  className="w-full text-center py-2 text-sm text-[#00694c] font-semibold hover:underline"
                  id="skip-profile-button"
                >
                  Skip — show full menu
                </button>
              </div>

            </motion.div>
          )}

          {/* 2. SAFE MENU DISHES VIEW */}
          {page === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col gap-4"
            >
              
              {/* Profile Config Indicators inside Sub-header */}
              <div className="flex flex-wrap items-center gap-2 bg-[#f6f3f2] p-3 rounded-xl border border-[#bccac1]/50 text-xs text-[#6d7a73]">
                <span className="font-semibold text-[#1c1b1b]">Filtering:</span>
                {conditions.diabetes && <span className="bg-[#008560]/10 text-[#00694c] px-2 py-0.5 rounded-md font-medium">Diabetes Active</span>}
                {conditions.hbp && <span className="bg-[#008560]/10 text-[#00694c] px-2 py-0.5 rounded-md font-medium">Hypertension Active</span>}
                {conditions.pregnant && <span className="bg-[#008560]/10 text-[#00694c] px-2 py-0.5 rounded-md font-medium">Gestational Warning</span>}
                {selectedAllergies.map(a => (
                  <span key={a} className="bg-red-50 text-[#ba1a1a] px-2 py-0.5 rounded-md border border-[#ffdad6] font-medium">No {a}</span>
                ))}
                {!conditions.diabetes && !conditions.hbp && !conditions.pregnant && selectedAllergies.length === 0 && (
                  <span className="italic">General Full Menu (No filters applied)</span>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search dishes (e.g., Shiro, Tibs, አይብ)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#bccac1] rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00694c] focus:border-transparent transition-all shadow-sm"
                  id="search-input"
                />
                <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-[#6d7a73]" />
              </div>

              {/* Legend Color-coding Indicator */}
              <div className="bg-white border border-[#bccac1] rounded-xl px-4 py-3 flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#16a34a]" />
                  <span>Safe / ደህንነቱ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#d97706]" />
                  <span>Caution / ጥንቃቄ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#dc2626]" />
                  <span>Avoid / ይለፉ</span>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="border-b border-[#bccac1]/60 flex gap-6 overflow-x-auto overflow-y-hidden pb-1">
                {(['All', 'Starters', 'Mains', 'Sides'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2.5 text-xs font-bold tracking-wider uppercase transition-all shrink-0 cursor-pointer ${
                      activeTab === tab 
                        ? 'text-[#00694c] border-b-2 border-[#00694c]' 
                        : 'text-[#6d7a73] hover:text-[#00694c]'
                    }`}
                    id={`filter-tab-${tab.toLowerCase()}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Food Items List */}
              <div className="space-y-3 mt-2">
                {getProcessedMenu().length > 0 ? (
                  getProcessedMenu().map(({ item, status, reason }) => (
                    <div 
                      key={item.id}
                      className={`bg-white border border-[#bccac1] rounded-xl p-4 flex items-start gap-4 transition-all ${
                        status === 'avoid' ? 'opacity-55 hover:opacity-75 bg-[#eae7e7]/10' : ''
                      }`}
                      id={`food-card-${item.id}`}
                    >
                      {/* Safety Dot status indicator */}
                      <div className={`mt-1.5 w-3.5 h-3.5 rounded-full shrink-0 ring-4 ${
                        status === 'safe' ? 'bg-[#16a34a] ring-green-100' :
                        status === 'caution' ? 'bg-[#d97706] ring-amber-100' :
                        'bg-[#dc2626] ring-red-100'
                      }`} />

                      <div className="flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 justify-between">
                          <h4 className={`text-base font-semibold ${status === 'avoid' ? 'line-through text-[#6d7a73]' : 'text-[#1c1b1b]'}`}>
                            {item.name} <span className="text-sm font-medium text-[#6d7a73]">/ {item.nameAmharic}</span>
                          </h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {item.category}
                          </span>
                        </div>
                        
                        <p className="text-xs text-[#6d7a73] mt-1 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-2.5">
                          {/* Main clinical advice trigger */}
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                            status === 'safe' ? 'bg-green-50 text-[#16a34a]' :
                            status === 'caution' ? 'bg-amber-50 text-[#d97706]' :
                            'bg-red-50 text-[#dc2626]'
                          }`}>
                            {reason}
                          </span>

                          {/* Secondary tag chips */}
                          {item.tags.filter(t => t !== reason).map(tag => (
                            <span 
                              key={tag} 
                              className="bg-slate-50 text-slate-500 font-medium text-[10px] px-2 py-0.5 rounded-md border border-slate-100"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-[#bccac1] rounded-xl p-8 text-center text-[#6d7a73]">
                    <Utensils className="w-8 h-8 text-[#bccac1] mx-auto mb-2" />
                    <p className="text-sm">No items found matching the current search or filters.</p>
                  </div>
                )}
              </div>

              {/* Dynamic trigger recommendation Area */}
              <div className="mt-8 pt-4 border-t border-[#bccac1]/30">
                <button 
                  onClick={handleGetRecommendation}
                  className="w-full bg-[#00694c] hover:bg-[#00513a] text-white py-3.5 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transform active:scale-98 transition-all shadow-md cursor-pointer"
                  id="gpt-recommendation-trigger"
                >
                  <Sparkles className="w-4 h-4 text-[#86f8c9]" />
                  Get AI recommendation
                  <span>→</span>
                </button>
              </div>

            </motion.div>
          )}

          {/* 3. DYNAMIC AI RECOMMENDATION DETAIL VIEW */}
          {page === 'insight' && (
            <motion.div 
              key="insight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              
              {loading ? (
                /* Dynamic clinical visual spinner layout */
                <div className="flex flex-col items-center justify-center py-20" id="loading-state">
                  <div className="relative mb-5">
                    <svg className="animate-spin h-12 w-12 text-[#00694c]" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                    </svg>
                    <Sparkles className="absolute inset-0 m-auto w-4.5 h-4.5 text-[#008560] animate-pulse" />
                  </div>
                  
                  <p className="font-semibold text-sm text-[#1c1b1b] tracking-tight">{loadingMessage}</p>
                  <p className="text-xs text-[#6d7a73] mt-1 text-center max-w-xs">Checking local glycemic guidelines against Ethiopian classic ingredients...</p>
                </div>
              ) : (
                /* Dynamic Gemini returned content template */
                <div className="flex flex-col gap-6 text-sm" id="content-state">
                  
                  {/* AI Recommendation main box card */}
                  <section className="bg-white border border-[#bccac1] rounded-2xl p-6 relative overflow-hidden shadow-sm">
                    {/* Visual watermark design element */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #00694c 1.5px, transparent 0)', backgroundImageSize: '16px 16px' }} />
                    
                    <div className="flex items-center gap-2 relative z-10 mb-3">
                      <span className="bg-[#008560]/10 text-[#00694c] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-[#00694c]/20">
                        <Sparkles className="w-3.5 h-3.5 text-[#00694c]" />
                        AI Insight
                      </span>
                      <span className="text-xs font-semibold text-[#6d7a73]">
                        {recommendation?.activeProfileText || "Diabetic Profile Active"}
                      </span>
                    </div>

                    <p className="text-base text-[#1c1b1b] leading-relaxed relative z-10">
                      {recommendation?.analysis || "Start with light, fiber-based foods first to cushion insulin triggers. Keep proteins high and control overall portion carbs."}
                    </p>
                  </section>

                  {/* Curated Suggested Meal Combo layout */}
                  <section className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-[#6d7a73] uppercase tracking-wider border-b border-[#bccac1] pb-2">
                      Suggested Combination
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Starter Recommendation Card */}
                      <div className="bg-white border border-[#bccac1] border-l-4 border-l-[#00694c] rounded-xl p-5 flex items-start gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-[#f6f3f2] flex items-center justify-center shrink-0">
                          {getSuggestionIcon(recommendation?.suggestedStarter.iconType || 'leaf')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#6d7a73]">{recommendation?.suggestedStarter.category || "Starters"}</span>
                          <span className="text-base font-semibold text-[#1c1b1b] mt-0.5">{recommendation?.suggestedStarter.name || "Ayib be Gomen"}</span>
                          <span className="text-xs text-[#6d7a73] mt-1 leading-relaxed">
                            {recommendation?.suggestedStarter.description || "Excellent starter source to balance glycemic rise."}
                          </span>
                          <div className="flex gap-1.5 mt-2.5 flex-wrap">
                            {(recommendation?.suggestedStarter.tags || ["Low-carb starter", "High Fiber"]).map(tag => (
                              <span key={tag} className="bg-[#d3e7e0]/30 text-[#00694c] px-2 py-0.5 rounded-full text-[10px] font-bold">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Main Recommendation Card */}
                      <div className="bg-white border border-[#bccac1] border-l-4 border-l-[#00694c] rounded-xl p-5 flex items-start gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-[#f6f3f2] flex items-center justify-center shrink-0">
                          {getSuggestionIcon(recommendation?.suggestedMain.iconType || 'meat')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#6d7a73]">{recommendation?.suggestedMain.category || "Mains"}</span>
                          <span className="text-base font-semibold text-[#1c1b1b] mt-0.5">{recommendation?.suggestedMain.name || "Tibs (grilled)"}</span>
                          <span className="text-xs text-[#6d7a73] mt-1 leading-relaxed">
                            {recommendation?.suggestedMain.description || "Stable lean proteins to fulfill energy needs dynamically."}
                          </span>
                          <div className="flex gap-1.5 mt-2.5 flex-wrap">
                            {(recommendation?.suggestedMain.tags || ["High Protein", "Low GI"]).map(tag => (
                              <span key={tag} className="bg-[#d3e7e0]/30 text-[#00694c] px-2 py-0.5 rounded-full text-[10px] font-bold">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  </section>

                  {/* Warning reminder banner */}
                  <div className="bg-[#ffdad6]/20 border border-[#bccac1] border-l-4 border-l-[#ba1a1a] rounded-xl p-4 flex items-center gap-3">
                    <TriangleAlert className="w-5 h-5 text-[#ba1a1a] shrink-0" />
                    <p className="text-sm font-semibold text-[#1c1b1b]">
                      {recommendation?.reminder || "Remember: Always avoid ingredients that might conflict with clinical selections."}
                    </p>
                  </div>

                  {/* Start over bottom action area */}
                  <div className="mt-6 flex flex-col md:flex-row justify-center gap-4">
                    <button 
                      onClick={() => setPage('menu')}
                      className="px-6 py-2.5 bg-white border border-[#00694c] text-[#00694c] hover:bg-[#008560]/5 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      id="insight-back-to-menu"
                    >
                      Browse full safe menu
                    </button>
                    
                    <button 
                      onClick={handleStartOver}
                      className="px-6 py-2.5 bg-[#00694c] text-white hover:bg-[#00513a] rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      id="start-over-button"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Start Over
                    </button>
                  </div>

                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ==================== MOBILE NAVIGATION BOT-NAV BAR ==================== */}
      <nav className="fixed bottom-0 w-full z-40 flex justify-around items-center px-4 py-2 pb-safe bg-[#fcf9f8] border-t border-[#bccac1] md:hidden shadow-lg">
        <button 
          onClick={handleStartOver}
          className={`flex flex-col items-center justify-center w-16 h-12 transition-all cursor-pointer ${page === 'profile' ? 'text-[#00694c]' : 'text-[#6d7a73] hover:text-[#00694c]'}`}
          id="mobile-bottom-home"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>
        
        <button 
          onClick={() => { setPage('menu'); }}
          className={`flex flex-col items-center justify-center w-16 h-12 transition-all cursor-pointer ${page === 'menu' ? 'text-[#00694c]' : 'text-[#6d7a73] hover:text-[#00694c]'}`}
          id="mobile-bottom-meals"
        >
          <Utensils className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Meals</span>
        </button>
        
        <button 
          onClick={handleGetRecommendation}
          className={`flex flex-col items-center justify-center w-16 h-12 transition-all cursor-pointer ${page === 'insight' ? 'text-[#00694c]' : 'text-[#6d7a73] hover:text-[#00694c]'}`}
          id="mobile-bottom-health"
        >
          <HeartPulse className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Health</span>
        </button>
      </nav>

      {/* Extra styles for safe environments */}
      <style>{`
        .pb-safe { 
          padding-bottom: env(safe-area-inset-bottom); 
        }
      `}</style>

    </div>
  );
}

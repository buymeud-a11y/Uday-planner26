import React, { useState, useEffect } from "react";
import { Coffee, Sun, Moon, MapPin, Star, Utensils, Lightbulb, CloudSun, Wallet, ShieldAlert, Languages, X, Loader2 } from "lucide-react";

// --- Helper Functions ---
const formatINR = (amount) => {
  if (!amount && amount !== 0) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// --- Sub-Components ---
const DayCard = ({ day, index }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border fade-in-up fade-delay-${Math.min(index + 1, 5)}`} style={{ borderColor: "#E5DFD3" }} data-testid={`day-card-${day.day}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: "#E8580A" }}>{day.day}</div>
      <h3 className="text-base font-medium leading-tight" style={{ color: "#1C3325", fontFamily: "Outfit, sans-serif" }}>{day.title}</h3>
    </div>
    
    {day.morning && (
      <div className="flex gap-3 mb-3">
        <Coffee size={15} style={{ color: "#D99C42", flexShrink: 0, marginTop: 2 }} strokeWidth={1.5} />
        <div>
          <span className="text-xs tracking-[0.1em] uppercase font-bold" style={{ color: "#75837A" }}>Morning</span>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "#4A5A50" }}>{day.morning}</p>
        </div>
      </div>
    )}
    
    {day.afternoon && (
      <div className="flex gap-3 mb-3">
        <Sun size={15} style={{ color: "#D96B42", flexShrink: 0, marginTop: 2 }} strokeWidth={1.5} />
        <div>
          <span className="text-xs tracking-[0.1em] uppercase font-bold" style={{ color: "#75837A" }}>Afternoon</span>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "#4A5A50" }}>{day.afternoon}</p>
        </div>
      </div>
    )}
    
    {day.evening && (
      <div className="flex gap-3 mb-4">
        <Moon size={15} style={{ color: "#1C3325", flexShrink: 0, marginTop: 2 }} strokeWidth={1.5} />
        <div>
          <span className="text-xs tracking-[0.1em] uppercase font-bold" style={{ color: "#75837A" }}>Evening</span>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "#4A5A50" }}>{day.evening}</p>
        </div>
      </div>
    )}
    
    <div className="border-t pt-3" style={{ borderColor: "#E5DFD3" }}>
      {day.places_visited?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {day.places_visited.map((place) => (
            <span key={place} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: "#F2ECE4", color: "#4A5A50" }}>
              <MapPin size={9} style={{ color: "#D96B42" }} /> {place}
            </span>
          ))}
        </div>
      )}
      {day.food_recommendation && (
        <div className="flex items-start gap-1.5">
          <Utensils size={12} style={{ color: "#D96B42", marginTop: 2, flexShrink: 0 }} />
          <p className="text-xs" style={{ color: "#75837A" }}>
            <span style={{ color: "#D96B42", fontWeight: 600 }}>{day.food_recommendation}</span>
            {day.estimated_food_cost_inr ? ` · Est. ${formatINR(day.estimated_food_cost_inr)}` : ""}
          </p>
        </div>
      )}
    </div>
  </div>
);

const TranslatorModal = ({ isOpen, onClose }) => {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTranslate = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/tour/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setTranslated(data.translation);
    } catch (error) {
      setTranslated("Translation failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b" style={{ background: "#1C3325" }}>
          <h3 className="text-white font-medium flex items-center gap-2"><Languages size={18} /> Instant Translator</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <textarea 
            className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8580A]"
            rows="3" placeholder="Paste foreign text here..."
            value={text} onChange={(e) => setText(e.target.value)}
          />
          <button 
            onClick={handleTranslate} 
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-white font-medium flex justify-center items-center gap-2 transition"
            style={{ background: "#E8580A" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Translate to English"}
          </button>
          {translated && (
            <div className="p-3 rounded-xl border bg-gray-50 text-sm text-[#4A5A50]">
              <span className="font-bold block mb-1 text-[#1C3325]">Translation:</span>
              {translated}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Main Component ---
const TourPlanSection = ({ tourData }) => {
  const [translatorOpen, setTranslatorOpen] = useState(false);
  
  // State variables for real-time data
  const [liveWeather, setLiveWeather] = useState("Loading weather...");
  const [liveCurrency, setLiveCurrency] = useState("Loading rates...");
  
  const essentials = tourData.international_essentials;

  // Optimized API Fetcher (Runs once when the component mounts with destination data)
  useEffect(() => {
    // Fetch Live Weather via Open-Meteo (Free, No API Key)
    const fetchWeather = async () => {
      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(tourData.destination)}&count=1`);
        const geoData = await geoRes.json();
        
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude } = geoData.results[0];
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const weatherData = await weatherRes.json();
          const temp = Math.round(weatherData.current_weather.temperature);
          setLiveWeather(`${temp}°C Current`);
        } else {
          setLiveWeather("Weather N/A");
        }
      } catch (e) {
        setLiveWeather("Weather N/A");
      }
    };

    // Fetch Live Currency via Frankfurter (Free, No API Key)
    const fetchCurrency = async () => {
      try {
        const currencyString = essentials?.local_currency || tourData.currency;
        const match = currencyString?.match(/\b[A-Z]{3}\b/);
        const targetCurrency = match ? match[0] : null;

        if (targetCurrency && targetCurrency !== 'INR') {
          const res = await fetch(`https://api.frankfurter.app/latest?from=${targetCurrency}&to=INR`);
          const data = await res.json();
          setLiveCurrency(`1 ${targetCurrency} = ₹${data.rates.INR.toFixed(2)}`);
        } else {
          setLiveCurrency(essentials?.exchange_rate_estimate_inr || "Domestic (INR)");
        }
      } catch (e) {
        setLiveCurrency(essentials?.exchange_rate_estimate_inr || "Rates N/A");
      }
    };

    if (tourData.destination) {
      fetchWeather();
      fetchCurrency();
    }
  }, [tourData.destination, essentials, tourData.currency]);

  return (
    <section className="py-16 px-4 relative" style={{ background: "#FDF6EE" }} data-testid="tour-plan-section">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.2em] uppercase font-bold mb-2" style={{ color: "#E8580A", fontFamily: "Manrope, sans-serif" }}>Day-by-Day Itinerary</p>
          <h2 className="text-3xl sm:text-4xl font-medium mb-3" style={{ color: "#1C3325", fontFamily: "Outfit, sans-serif" }}>Your {tourData.duration_days}-Day Tour of {tourData.destination}</h2>
          <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: "#4A5A50" }}>{tourData.overview}</p>
        </div>

        {/* Real-time Data & Meta Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="px-5 py-2 rounded-full text-sm" style={{ background: "#DCFCE7", color: "#15803D", fontWeight: 500 }}>{tourData.state_country}</div>
          
          {tourData.best_time_to_visit && (
            <div className="px-5 py-2 rounded-full text-sm" style={{ background: "#E8F4FB", color: "#0E7490", fontWeight: 500 }}>
              Best time: <span className="font-bold">{tourData.best_time_to_visit}</span>
            </div>
          )}
          
          <div className="px-5 py-2 rounded-full text-sm flex items-center gap-1.5 transition-all duration-500" style={{ background: "#F3F4F6", color: "#374151", fontWeight: 500 }}>
            <CloudSun size={15} /> <span>{liveWeather}</span>
          </div>
          
          <div className="px-5 py-2 rounded-full text-sm flex items-center gap-1.5 transition-all duration-500" style={{ background: "#F3F4F6", color: "#374151", fontWeight: 500 }}>
            <Wallet size={15} /> <span>{liveCurrency}</span>
          </div>
        </div>

        {/* Top Highlights */}
        {tourData.highlights?.length > 0 && (
          <div className="rounded-2xl p-6 mb-8" style={{ background: "linear-gradient(135deg, #0E7490 0%, #0891B2 100%)" }}>
            <h3 className="text-base font-medium text-white mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Top Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {tourData.highlights.map((h) => (
                <div key={h} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full" style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}>
                  <Star size={11} fill="#FCD34D" stroke="#FCD34D" />{h}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {tourData.itinerary?.map((day, i) => (
            <DayCard key={day.day} day={day} index={i} />
          ))}
        </div>

        {/* Essentials & Travel Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          
          {/* International Essentials (Only renders if backend LLM provides the essentials block) */}
          {essentials && (
            <div className="rounded-2xl p-6 shadow-sm border bg-white" style={{ borderColor: "#E5DFD3" }}>
               <div className="flex items-center gap-2 mb-4 border-b pb-3" style={{ borderColor: "#E5DFD3" }}>
                <ShieldAlert size={18} style={{ color: "#E8580A" }} />
                <h3 className="text-base font-medium" style={{ color: "#1C3325", fontFamily: "Outfit, sans-serif" }}>Travel Essentials</h3>
              </div>
              <ul className="space-y-3 text-sm" style={{ color: "#4A5A50" }}>
                <li><strong style={{ color: "#1C3325" }}>Visa (Indians):</strong> {essentials.visa_requirements_for_indians}</li>
                <li><strong style={{ color: "#1C3325" }}>Currency:</strong> {essentials.local_currency}</li>
                <li><strong style={{ color: "#1C3325" }}>Emergency:</strong> {essentials.emergency_numbers}</li>
                <li><strong style={{ color: "#1C3325" }}>Etiquette:</strong> {essentials.cultural_etiquette}</li>
              </ul>
            </div>
          )}

          {/* Travel Tips */}
          {tourData.travel_tips?.length > 0 && (
            <div className="rounded-2xl p-6 shadow-sm border" style={{ background: "#FEF3C7", borderColor: "#FDE68A" }}>
              <div className="flex items-center gap-2 mb-4 border-b pb-3" style={{ borderColor: "#FCD34D" }}>
                <Lightbulb size={18} style={{ color: "#D97706" }} strokeWidth={1.5} />
                <h3 className="text-base font-medium" style={{ color: "#92400E", fontFamily: "Outfit, sans-serif" }}>Local Tips</h3>
              </div>
              <ul className="space-y-2">
                {tourData.travel_tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-sm" style={{ color: "#78350F" }}>
                    <span className="font-bold mt-0.5" style={{ color: "#D97706" }}>•</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>

      {/* Floating Action Button (FAB) for Translator */}
      <button 
        onClick={() => setTranslatorOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl hover:scale-105 transition-transform z-40 group"
        style={{ background: "#1C3325" }}
      >
        <Languages size={24} className="text-white" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Translate Local Text
        </span>
      </button>

      {/* Translation Modal Overlay */}
      <TranslatorModal isOpen={translatorOpen} onClose={() => setTranslatorOpen(false)} />

    </section>
  );
};

export default TourPlanSection;

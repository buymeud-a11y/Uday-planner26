import React, { useState, useEffect, useMemo } from "react";
import { ShieldAlert, CheckCircle2, Info, Smartphone, Bus, Briefcase, Phone, Landmark, Languages, CloudSun, Wallet, Loader2 } from "lucide-react";

const TravelEssentialsTab = ({ tourData }) => {
 const essentials = useMemo(() => tourData.international_essentials || {}, [tourData.international_essentials]);
  
  // Real-time states
  const [liveWeather, setLiveWeather] = useState("Loading weather...");
  const [liveCurrency, setLiveCurrency] = useState("Loading rates...");
  
  // Translator states
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(tourData.destination)}&count=1`);
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude } = geoData.results[0];
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const weatherData = await weatherRes.json();
          setLiveWeather(`${Math.round(weatherData.current_weather.temperature)}°C Current`);
        } else setLiveWeather("Weather N/A");
      } catch (e) { setLiveWeather("Weather N/A"); }
    };

    const fetchCurrency = async () => {
      try {
        const targetCurrency = (essentials.local_currency || "").match(/\b[A-Z]{3}\b/)?.[0];
        if (targetCurrency && targetCurrency !== 'INR') {
          const res = await fetch(`https://api.frankfurter.app/latest?from=${targetCurrency}&to=INR`);
          const data = await res.json();
          setLiveCurrency(`1 ${targetCurrency} = ₹${data.rates.INR.toFixed(2)}`);
        } else {
          setLiveCurrency(essentials.exchange_rate_estimate_inr || "Domestic (INR)");
        }
      } catch (e) { setLiveCurrency(essentials.exchange_rate_estimate_inr || "Rates N/A"); }
    };

    if (tourData.destination) {
      fetchWeather();
      fetchCurrency();
    }
  }, [tourData.destination, essentials]);

  const handleTranslate = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/tour/translate`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text })
      });
      const data = await res.json();
      setTranslated(data.translation);
    } catch (error) { setTranslated("Translation failed. Please try again."); }
    setLoading(false);
  };

  return (
    <section className="py-10 px-4" style={{ background: "#FDF6EE" }}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Real-time Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4" style={{ borderColor: "#E5DFD3" }}>
            <div className="p-3 rounded-full" style={{ background: "#E8F4FB" }}><CloudSun size={24} color="#0E7490" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#75837A" }}>Live Weather • {tourData.destination}</p>
              <p className="text-lg font-medium text-gray-900">{liveWeather}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4" style={{ borderColor: "#E5DFD3" }}>
            <div className="p-3 rounded-full" style={{ background: "#FEF3C7" }}><Wallet size={24} color="#92400E" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#75837A" }}>Live Currency Exchange</p>
              <p className="text-lg font-medium text-gray-900">{liveCurrency}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Requirements & Checklists */}
          <div className="space-y-6">
            
            {/* Visa & Entry */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "#E5DFD3" }}>
              <div className="flex items-center gap-2 mb-4 border-b pb-3" style={{ borderColor: "#E5DFD3" }}>
                <ShieldAlert size={20} style={{ color: "#E8580A" }} />
                <h3 className="text-lg font-medium" style={{ color: "#1C3325", fontFamily: "Outfit, sans-serif" }}>Visa & Entry Requirements</h3>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-3">{essentials.visa_requirements}</p>
              <ul className="space-y-2">
                {essentials.entry_checklist?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Packing & Connectivity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "#E5DFD3" }}>
              <div className="flex items-center gap-2 mb-4 border-b pb-3" style={{ borderColor: "#E5DFD3" }}>
                <Briefcase size={20} style={{ color: "#0E7490" }} />
                <h3 className="text-lg font-medium" style={{ color: "#1C3325", fontFamily: "Outfit, sans-serif" }}>Packing & SIM</h3>
              </div>
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2"><Smartphone size={14}/> Local SIM / Connectivity</p>
                <p className="text-sm text-gray-600">{essentials.sim_and_connectivity}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-2">Packing Checklist</p>
                <ul className="space-y-1">
                  {essentials.packing_checklist?.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Country Facts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "#E5DFD3" }}>
              <div className="flex items-center gap-2 mb-2">
                <Info size={20} style={{ color: "#1C3325" }} />
                <h3 className="text-lg font-medium" style={{ color: "#1C3325", fontFamily: "Outfit, sans-serif" }}>Country Facts</h3>
              </div>
              <p className="text-sm text-gray-600">{essentials.country_facts}</p>
            </div>

          </div>

          {/* Right Column: Translator, Transport & Emergency */}
          <div className="space-y-6">
            
            {/* Translation Tool */}
            <div className="rounded-2xl p-6 shadow-sm border" style={{ background: "#1C3325", borderColor: "#1C3325" }}>
              <div className="flex items-center gap-2 mb-4 border-b border-gray-600 pb-3">
                <Languages size={20} className="text-white" />
                <h3 className="text-lg font-medium text-white" style={{ fontFamily: "Outfit, sans-serif" }}>Local Translator</h3>
              </div>
              <p className="text-sm text-gray-300 mb-3">Paste or type local signage, menus, or text below:</p>
              <textarea 
                className="w-full p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8580A] bg-white/10 text-white placeholder-gray-400 border border-gray-600 mb-3"
                rows="3" placeholder="Enter foreign text here..."
                value={text} onChange={(e) => setText(e.target.value)}
              />
              <button 
                onClick={handleTranslate} disabled={loading}
                className="w-full py-2.5 rounded-xl text-white font-medium flex justify-center items-center gap-2 transition hover:opacity-90"
                style={{ background: "#E8580A" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Translate to English"}
              </button>
              {translated && (
                <div className="mt-4 p-3 rounded-xl bg-white text-sm text-gray-900 shadow-inner">
                  <span className="font-bold block mb-1 text-[#E8580A]">English Translation:</span>
                  {translated}
                </div>
              )}
            </div>

            {/* Transport Guide */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "#E5DFD3" }}>
              <div className="flex items-center gap-2 mb-3 border-b pb-3" style={{ borderColor: "#E5DFD3" }}>
                <Bus size={20} style={{ color: "#D99C42" }} />
                <h3 className="text-lg font-medium" style={{ color: "#1C3325", fontFamily: "Outfit, sans-serif" }}>Transport Guide</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{essentials.local_transport_guide}</p>
            </div>

            {/* Emergencies & Embassy */}
            <div className="bg-red-50 rounded-2xl p-6 shadow-sm border border-red-100">
              <div className="flex items-center gap-2 mb-4 border-b border-red-200 pb-3">
                <Phone size={20} className="text-red-600" />
                <h3 className="text-lg font-medium text-red-900" style={{ fontFamily: "Outfit, sans-serif" }}>Emergency & Embassy</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-red-900 mb-1">Local Emergency Numbers</p>
                  <p className="text-sm text-red-700">{essentials.emergency_numbers}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-900 mb-1 flex items-center gap-2"><Landmark size={14}/> Embassy / Consulate Info</p>
                  <p className="text-sm text-red-700">{essentials.embassy_info}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelEssentialsTab;

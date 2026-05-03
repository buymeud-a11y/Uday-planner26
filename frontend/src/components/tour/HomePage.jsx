import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Map, Crown, Tag, RefreshCw, Share2, Check, Download } from "lucide-react";
import HeroSection from "./HeroSection";
import TourPlanSection from "./TourPlanSection";
import PlanCard from "./PlanCard";
import LoadingState from "./LoadingState";
import PrintableView from "./PrintableView";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const tabs = [
  { id: "plan", label: "Tour Plan", Icon: Map, color: "#0891B2" },
  { id: "premium", label: "Premium Tour", Icon: Crown, color: "#D97706" },
  { id: "budget", label: "Budget Tour", Icon: Tag, color: "#16A34A" },
];

const ResultsTabs = ({ activeTab, setActiveTab, planId, onShare, copied }) => (
  <div
    className="sticky top-0 z-20 border-b"
    style={{ background: "rgba(253,246,238,0.97)", backdropFilter: "blur(8px)", borderColor: "#E0D4C0" }}
    data-testid="results-tabs"
  >
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center gap-2 py-3 overflow-x-auto">
        {tabs.map(({ id, label, Icon, color }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            data-testid={`tab-${id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5"
            style={{
              background: activeTab === id ? color : `${color}18`,
              color: activeTab === id ? "#fff" : color,
              fontFamily: "Manrope, sans-serif",
              boxShadow: activeTab === id ? `0 4px 14px ${color}55` : "none",
            }}
          >
            <Icon size={14} strokeWidth={1.8} />
            {label}
          </button>
        ))}

        {/* Share button */}
        {planId && (
          <button
            onClick={onShare}
            data-testid="btn-share"
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap hover:-translate-y-0.5"
            style={{
              background: copied ? "#16A34A" : "#E8580A",
              color: "#fff",
              fontFamily: "Manrope, sans-serif",
              boxShadow: copied ? "0 4px 14px #16A34A55" : "0 4px 14px #E8580A55",
            }}
          >
            {copied ? <Check size={14} strokeWidth={2} /> : <Share2 size={14} strokeWidth={1.5} />}
            {copied ? "Copied!" : "Share Plan"}
          </button>
        )}
      </div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="py-10 text-center" style={{ background: "#1C3325" }}>
    <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Manrope, sans-serif" }}>
      Plan &amp; Tour · AI-Powered Travel Planning · Prices in INR
    </p>
  </footer>
);

const HomePage = () => {
  const [formData, setFormData] = useState({ place: "", days: "", budget: "" });
  const [tourData, setTourData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("plan");
  const [error, setError] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef(null);

  // On mount: check for ?plan= param and load shared plan
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedPlanId = params.get("plan");
    if (sharedPlanId) {
      setLoading(true);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
      axios.get(`${API}/tour/share/${sharedPlanId}`)
        .then((res) => {
          setTourData(res.data);
          setPlanId(sharedPlanId);
          setActiveTab("plan");
        })
        .catch(() => {
          setError("This shared tour plan could not be found or has expired.");
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const handleGenerate = async (tab) => {
    if (!formData.place.trim()) {
      setError("Please enter a destination to plan your tour.");
      return;
    }
    if (!formData.days || parseInt(formData.days) < 1) {
      setError("Please enter a valid number of days (minimum 1).");
      return;
    }

    setActiveTab(tab);
    setLoading(true);
    setError(null);
    setTourData(null);
    setPlanId(null);

    // Clear any existing ?plan= from URL
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const payload = {
        place: formData.place.trim(),
        days: parseInt(formData.days),
      };
      if (formData.budget && parseFloat(formData.budget) > 0) {
        payload.budget = parseFloat(formData.budget);
      }

      const response = await axios.post(`${API}/tour/generate`, payload);
      const data = response.data;
      setTourData(data);

      // Update URL with plan_id for shareability
      if (data.plan_id) {
        setPlanId(data.plan_id);
        const newUrl = `${window.location.pathname}?plan=${data.plan_id}`;
        window.history.replaceState({}, "", newUrl);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Failed to generate tour plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?plan=${planId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setTourData(null);
    setError(null);
    setPlanId(null);
    setCopied(false);
    setFormData({ place: "", days: "", budget: "" });
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ background: "#FDF6EE", minHeight: "100vh", fontFamily: "Manrope, sans-serif" }}>
      <HeroSection
        formData={formData}
        setFormData={setFormData}
        onGenerate={handleGenerate}
        error={error}
        loading={loading}
      />

      {/* Results anchor */}
      <div ref={resultsRef} />

      {loading && <LoadingState />}

      {tourData && !loading && (
        <>
          <ResultsTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            planId={planId}
            onShare={handleShare}
            copied={copied}
          />

          {activeTab === "plan" && (
            <TourPlanSection tourData={tourData} />
          )}
          {activeTab === "premium" && (
            <PlanCard
              plan={tourData.premium_plan}
              destination={tourData.destination}
              duration={tourData.duration_days}
              type="premium"
            />
          )}
          {activeTab === "budget" && (
            <PlanCard
              plan={tourData.budget_plan}
              destination={tourData.destination}
              duration={tourData.duration_days}
              type="budget"
            />
          )}

          {/* Bottom actions: Download PDF + Plan Another Trip */}
          <div className="py-8 flex flex-wrap justify-center gap-3" style={{ background: "#FDF6EE" }}>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: "#1C3325", color: "#fff", fontFamily: "Manrope, sans-serif" }}
              data-testid="btn-download-pdf"
            >
              <Download size={14} strokeWidth={1.5} />
              Download PDF
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{ border: "2px solid #D96B42", color: "#D96B42", fontFamily: "Manrope, sans-serif" }}
              data-testid="btn-reset"
            >
              <RefreshCw size={14} />
              Plan Another Trip
            </button>
          </div>

          {/* Hidden printable view — visible only on print/PDF */}
          <PrintableView tourData={tourData} />
        </>
      )}

      <Footer />
    </div>
  );
};

export default HomePage;

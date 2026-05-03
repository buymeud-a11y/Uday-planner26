import React, { useState, useRef } from "react";
import axios from "axios";
import { Map, Crown, Tag, RefreshCw } from "lucide-react";
import HeroSection from "./HeroSection";
import TourPlanSection from "./TourPlanSection";
import PlanCard from "./PlanCard";
import LoadingState from "./LoadingState";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const tabs = [
  { id: "plan", label: "Tour Plan", Icon: Map },
  { id: "premium", label: "Premium Tour", Icon: Crown },
  { id: "budget", label: "Budget Tour", Icon: Tag },
];

const ResultsTabs = ({ activeTab, setActiveTab }) => (
  <div
    className="sticky top-0 z-20 border-b"
    style={{ background: "rgba(250,249,246,0.95)", backdropFilter: "blur(8px)", borderColor: "#E5DFD3" }}
    data-testid="results-tabs"
  >
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex gap-1 py-3 overflow-x-auto">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            data-testid={`tab-${id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap"
            style={{
              background: activeTab === id ? "#1C3325" : "transparent",
              color: activeTab === id ? "#fff" : "#4A5A50",
              fontFamily: "Manrope, sans-serif",
            }}
          >
            <Icon size={14} strokeWidth={1.5} />
            {label}
          </button>
        ))}
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
  const resultsRef = useRef(null);

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

    // Scroll to loading section
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
      setTourData(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Failed to generate tour plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTourData(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ background: "#FAF9F6", minHeight: "100vh", fontFamily: "Manrope, sans-serif" }}>
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
          <ResultsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

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

          {/* Reset button */}
          <div className="py-8 text-center" style={{ background: "#FAF9F6" }}>
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
        </>
      )}

      <Footer />
    </div>
  );
};

export default HomePage;

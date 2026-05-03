import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, History, Compass, Plus } from "lucide-react";
import TourHistoryCard from "./TourHistoryCard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white border" style={{ borderColor: "#E5DFD3" }}>
    <div className="h-36 animate-pulse" style={{ background: "#E5DFD3" }} />
    <div className="p-5 space-y-3">
      <div className="h-4 rounded-full animate-pulse" style={{ background: "#E5DFD3", width: "55%" }} />
      <div className="h-3 rounded-full animate-pulse" style={{ background: "#F2ECE4", width: "35%" }} />
      <div className="h-16 rounded-xl animate-pulse mt-2" style={{ background: "#F2ECE4" }} />
      <div className="flex justify-between items-center mt-2">
        <div className="h-3 rounded-full animate-pulse" style={{ background: "#E5DFD3", width: "30%" }} />
        <div className="h-8 rounded-full animate-pulse" style={{ background: "#E5DFD3", width: "28%" }} />
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-20 px-4" data-testid="history-empty-state">
    <div
      className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
      style={{ background: "#F2ECE4" }}
    >
      <Compass size={36} style={{ color: "#D96B42" }} strokeWidth={1.5} />
    </div>
    <h3
      className="text-2xl font-medium mb-3"
      style={{ color: "#1C3325", fontFamily: "Outfit, sans-serif" }}
    >
      No tours planned yet
    </h3>
    <p className="text-base mb-8 max-w-sm mx-auto" style={{ color: "#75837A" }}>
      Start planning your first adventure and it will appear here for easy revisit.
    </p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ background: "#D96B42", color: "#fff", fontFamily: "Manrope, sans-serif" }}
      data-testid="btn-plan-first-trip"
    >
      <Plus size={16} /> Plan Your First Trip
    </Link>
  </div>
);

const HistoryPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API}/tour/history`)
      .then((res) => setPlans(res.data))
      .catch(() => setError("Could not load history. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "#FAF9F6", minHeight: "100vh", fontFamily: "Manrope, sans-serif" }}>
      {/* Dark header */}
      <header className="px-4 py-14" style={{ background: "#1C3325" }}>
        <div className="max-w-5xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.55)", fontFamily: "Manrope, sans-serif" }}
            data-testid="nav-back-home"
          >
            <ArrowLeft size={14} /> Back to Planner
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <History size={20} style={{ color: "#D96B42" }} strokeWidth={1.5} />
            <span
              className="text-xs tracking-[0.2em] uppercase font-bold"
              style={{ color: "#D96B42", fontFamily: "Manrope, sans-serif" }}
            >
              Your Travel History
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-medium text-white mb-3"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Recently Planned Tours
          </h1>
          <p className="text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
            {!loading && plans.length > 0
              ? `${plans.length} tour${plans.length !== 1 ? "s" : ""} planned · Click any card to view the full itinerary`
              : "Revisit your AI-generated tour plans anytime"}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {error && (
          <div
            className="p-4 rounded-xl text-sm mb-8"
            style={{ background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA" }}
            data-testid="history-error"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="history-skeleton"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : plans.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="history-grid"
          >
            {plans.map((plan, i) => (
              <TourHistoryCard key={plan.plan_id} plan={plan} index={i} />
            ))}
          </div>
        )}

        {/* CTA to plan new */}
        {!loading && plans.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "#D96B42", color: "#fff", fontFamily: "Manrope, sans-serif" }}
              data-testid="btn-plan-new-trip"
            >
              <Plus size={16} /> Plan a New Trip
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-10 text-center" style={{ background: "#1C3325" }}>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Manrope, sans-serif" }}>
          Plan &amp; Tour · AI-Powered Travel Planning · Prices in INR
        </p>
      </footer>
    </div>
  );
};

export default HistoryPage;

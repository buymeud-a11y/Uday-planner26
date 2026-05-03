import React from "react";
import { MapPin, Calendar, Wallet, Plane } from "lucide-react";

const HeroSection = ({ formData, setFormData, onGenerate, error, loading }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onGenerate("plan");
  };

  return (
    <section className="relative min-h-screen flex items-center" style={{ minHeight: "100vh" }}>
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1711907309566-1fa08d49df57?crop=entropy&cs=srgb&fm=jpg&q=85')`,
        }}
      />
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(28,51,37,0.88) 0%, rgba(28,51,37,0.65) 60%, rgba(28,51,37,0.5) 100%)" }}
      />

      <div className="relative z-10 w-full px-4 py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Branding */}
          <div className="lg:col-span-6 text-white">
            <div className="flex items-center gap-2 mb-5">
              <Plane size={20} style={{ color: "#D96B42" }} strokeWidth={1.5} />
              <span
                className="text-xs tracking-[0.25em] uppercase font-bold"
                style={{ color: "#D96B42", fontFamily: "Manrope, sans-serif" }}
              >
                AI-Powered Travel Planning
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-medium mb-6 leading-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Plan Your<br />
              Perfect{" "}
              <span style={{ color: "#D96B42" }}>Tour</span>
            </h1>
            <p
              className="text-base sm:text-lg mb-8 max-w-lg leading-relaxed"
              style={{ color: "rgba(255,255,255,0.82)", fontFamily: "Manrope, sans-serif" }}
            >
              Get a personalized travel itinerary with day-by-day plans, hotel
              recommendations, and car rental costs — in both Premium &amp; Budget
              options with INR pricing.
            </p>
            <div className="flex flex-wrap gap-4">
              {["Day-by-Day Itinerary", "Hotel Suggestions", "Car Rental Costs"].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-full"
                  style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)", fontFamily: "Manrope, sans-serif" }}
                >
                  <span style={{ color: "#D96B42" }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form card */}
          <div className="lg:col-span-6">
            <div
              className="rounded-2xl p-7 sm:p-9 shadow-2xl"
              style={{ background: "rgba(250,249,246,0.97)", backdropFilter: "blur(10px)" }}
            >
              <h2
                className="text-2xl font-medium mb-1"
                style={{ color: "#1C3325", fontFamily: "Outfit, sans-serif" }}
              >
                Where are you headed?
              </h2>
              <p className="text-sm mb-6" style={{ color: "#75837A", fontFamily: "Manrope, sans-serif" }}>
                Enter your destination and let AI do the planning
              </p>

              {/* Destination */}
              <div className="mb-4">
                <label
                  className="block text-xs tracking-[0.2em] uppercase font-bold mb-2"
                  style={{ color: "#4A5A50" }}
                >
                  Destination
                </label>
                <div
                  className="flex items-center rounded-2xl h-14 px-4 border-2 transition-colors"
                  style={{ borderColor: "#E5DFD3", background: "#fff" }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#D96B42"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#E5DFD3"}
                >
                  <MapPin size={18} style={{ color: "#D96B42", flexShrink: 0, marginRight: 10 }} strokeWidth={1.5} />
                  <input
                    type="text"
                    placeholder="e.g., Goa, Manali, Paris..."
                    value={formData.place}
                    onChange={(e) => setFormData((p) => ({ ...p, place: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-base"
                    style={{ color: "#1C3325", fontFamily: "Manrope, sans-serif", border: "none", outline: "none" }}
                    data-testid="input-place"
                  />
                </div>
              </div>

              {/* Days + Budget grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    className="block text-xs tracking-[0.2em] uppercase font-bold mb-2"
                    style={{ color: "#4A5A50" }}
                  >
                    No. of Days
                  </label>
                  <div
                    className="flex items-center rounded-2xl h-14 px-4 border-2 transition-colors"
                    style={{ borderColor: "#E5DFD3", background: "#fff" }}
                  >
                    <Calendar size={18} style={{ color: "#D96B42", flexShrink: 0, marginRight: 10 }} strokeWidth={1.5} />
                    <input
                      type="number"
                      placeholder="e.g., 5"
                      min="1"
                      max="30"
                      value={formData.days}
                      onChange={(e) => setFormData((p) => ({ ...p, days: e.target.value }))}
                      className="w-full bg-transparent text-base"
                      style={{ color: "#1C3325", fontFamily: "Manrope, sans-serif", border: "none", outline: "none" }}
                      data-testid="input-days"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-xs tracking-[0.2em] uppercase font-bold mb-2"
                    style={{ color: "#4A5A50" }}
                  >
                    Budget <span className="normal-case text-[10px] font-normal tracking-normal" style={{ color: "#75837A" }}>(optional)</span>
                  </label>
                  <div
                    className="flex items-center rounded-2xl h-14 px-4 border-2 transition-colors"
                    style={{ borderColor: "#E5DFD3", background: "#fff" }}
                  >
                    <Wallet size={18} style={{ color: "#D96B42", flexShrink: 0, marginRight: 6 }} strokeWidth={1.5} />
                    <span className="text-sm mr-1" style={{ color: "#4A5A50" }}>₹</span>
                    <input
                      type="number"
                      placeholder="50000"
                      value={formData.budget}
                      onChange={(e) => setFormData((p) => ({ ...p, budget: e.target.value }))}
                      className="w-full bg-transparent text-base"
                      style={{ color: "#1C3325", fontFamily: "Manrope, sans-serif", border: "none", outline: "none" }}
                      data-testid="input-budget"
                    />
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="mb-4 p-3 rounded-xl text-sm"
                  style={{ background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA" }}
                  data-testid="error-message"
                >
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => onGenerate("plan")}
                  disabled={loading}
                  className="w-full h-14 rounded-full font-bold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "#D96B42", color: "#fff", fontFamily: "Manrope, sans-serif" }}
                  data-testid="btn-plan-tour"
                >
                  {loading ? "Generating..." : "Plan Tour"}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onGenerate("premium")}
                    disabled={loading}
                    className="h-14 rounded-full font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "#1C3325", color: "#fff", fontFamily: "Manrope, sans-serif" }}
                    data-testid="btn-premium-tour"
                  >
                    Premium Tour
                  </button>
                  <button
                    onClick={() => onGenerate("budget")}
                    disabled={loading}
                    className="h-14 rounded-full font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ border: "2px solid #D96B42", color: "#D96B42", background: "transparent", fontFamily: "Manrope, sans-serif" }}
                    data-testid="btn-budget-tour"
                  >
                    Budget Tour
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

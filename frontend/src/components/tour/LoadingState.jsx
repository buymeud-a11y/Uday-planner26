import React from "react";
import { Plane } from "lucide-react";

const destinations = [
  "Goa", "Manali", "Kerala", "Rajasthan", "Ladakh", "Shimla",
  "Ooty", "Darjeeling", "Andaman", "Varanasi", "Rishikesh",
  "Mysore", "Agra", "Jaipur", "Mumbai", "Coorg", "Munnar"
];

const LoadingState = () => (
  <div
    className="min-h-[420px] flex flex-col items-center justify-center py-20 overflow-hidden relative"
    style={{ background: "#E0F2FA" }}
    data-testid="loading-state"
  >
    {/* Background marquee */}
    <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none">
      <div
        className="animate-marquee text-7xl font-bold"
        style={{ color: "#0C3D20", opacity: 0.08, fontFamily: "Outfit, sans-serif" }}
      >
        {[...destinations, ...destinations].map((d, i) => (
          <span key={i} className="mx-8">{d}</span>
        ))}
      </div>
    </div>

    {/* Foreground content */}
    <div className="relative z-10 text-center px-4">
      <div className="flex items-center justify-center mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: "#E8580A" }}
        >
          <Plane className="text-white float-plane" size={32} strokeWidth={1.5} />
        </div>
      </div>
      <h3
        className="text-2xl sm:text-3xl font-medium mb-3"
        style={{ color: "#1C3325", fontFamily: "Outfit, sans-serif" }}
      >
        AI is crafting your perfect itinerary...
      </h3>
      <p className="text-base mb-8" style={{ color: "#4A5A50", fontFamily: "Manrope, sans-serif" }}>
        Searching for best hotels, routes & local experiences
      </p>
      <div className="flex gap-2 justify-center">
        <div className="w-3 h-3 rounded-full dot-pulse-1" style={{ background: "#E8580A" }} />
        <div className="w-3 h-3 rounded-full dot-pulse-2" style={{ background: "#D97706" }} />
        <div className="w-3 h-3 rounded-full dot-pulse-3" style={{ background: "#16A34A" }} />
      </div>
    </div>
  </div>
);

export default LoadingState;

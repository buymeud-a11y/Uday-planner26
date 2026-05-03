import React from "react";
import { Coffee, Sun, Moon, MapPin, Star, Utensils, Lightbulb } from "lucide-react";

const formatINR = (amount) => {
  if (!amount && amount !== 0) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const StarIcons = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={12}
        fill={i < Math.round(rating || 0) ? "#D99C42" : "none"}
        stroke="#D99C42"
        strokeWidth={1.5}
      />
    ))}
    {rating && <span className="ml-1 text-xs font-medium" style={{ color: "#4A5A50" }}>{rating}</span>}
  </div>
);

const DayCard = ({ day, index }) => (
  <div
    className={`bg-white rounded-2xl p-6 shadow-sm border fade-in-up fade-delay-${Math.min(index + 1, 5)}`}
    style={{ borderColor: "#E5DFD3" }}
    data-testid={`day-card-${day.day}`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{ background: "#E8580A" }}
      >
        {day.day}
      </div>
      <h3
        className="text-base font-medium leading-tight"
        style={{ color: "#1C3325", fontFamily: "Outfit, sans-serif" }}
      >
        {day.title}
      </h3>
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
            <span
              key={place}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
              style={{ background: "#F2ECE4", color: "#4A5A50" }}
            >
              <MapPin size={9} style={{ color: "#D96B42" }} />
              {place}
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

const TourPlanSection = ({ tourData }) => (
  <section className="py-16 px-4" style={{ background: "#FDF6EE" }} data-testid="tour-plan-section">
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <p
          className="text-xs tracking-[0.2em] uppercase font-bold mb-2"
          style={{ color: "#E8580A", fontFamily: "Manrope, sans-serif" }}
        >
          Day-by-Day Itinerary
        </p>
        <h2
          className="text-3xl sm:text-4xl font-medium mb-3"
          style={{ color: "#1C3325", fontFamily: "Outfit, sans-serif" }}
        >
          Your {tourData.duration_days}-Day Tour of {tourData.destination}
        </h2>
        <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: "#4A5A50" }}>
          {tourData.overview}
        </p>
      </div>

      {/* Meta pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {tourData.best_time_to_visit && (
          <div className="px-5 py-2 rounded-full text-sm" style={{ background: "#E8F4FB", color: "#0E7490", fontWeight: 500 }}>
            Best time: <span className="font-bold">{tourData.best_time_to_visit}</span>
          </div>
        )}
        {tourData.estimated_total_food_cost_inr > 0 && (
          <div className="px-5 py-2 rounded-full text-sm" style={{ background: "#FEF3C7", color: "#92400E", fontWeight: 500 }}>
            Est. food: <span className="font-bold">{formatINR(tourData.estimated_total_food_cost_inr)}</span>
          </div>
        )}
        <div className="px-5 py-2 rounded-full text-sm" style={{ background: "#DCFCE7", color: "#15803D", fontWeight: 500 }}>
          {tourData.state_country}
        </div>
      </div>

      {/* Highlights */}
      {tourData.highlights?.length > 0 && (
        <div className="rounded-2xl p-6 mb-8" style={{ background: "linear-gradient(135deg, #0E7490 0%, #0891B2 100%)" }}>
          <h3 className="text-base font-medium text-white mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
            Top Highlights
          </h3>
          <div className="flex flex-wrap gap-2">
            {tourData.highlights.map((h) => (
              <div
                key={h}
                className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full"
                style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
              >
                <Star size={11} fill="#FCD34D" stroke="#FCD34D" />
                {h}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tourData.itinerary?.map((day, i) => (
          <DayCard key={day.day} day={day} index={i} />
        ))}
      </div>

      {/* Travel tips */}
      {tourData.travel_tips?.length > 0 && (
        <div className="mt-8 rounded-2xl p-6" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} style={{ color: "#D97706" }} strokeWidth={1.5} />
            <h3 className="text-base font-medium" style={{ color: "#92400E", fontFamily: "Outfit, sans-serif" }}>
              Travel Tips
            </h3>
          </div>
          <ul className="space-y-2">
            {tourData.travel_tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm" style={{ color: "#78350F" }}>
                <span className="font-bold mt-0.5" style={{ color: "#D97706" }}>•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </section>
);

export default TourPlanSection;

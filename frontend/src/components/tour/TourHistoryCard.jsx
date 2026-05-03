import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";

const GRADIENTS = [
  "linear-gradient(135deg, #0F5132 0%, #16A34A 100%)",
  "linear-gradient(135deg, #E8580A 0%, #C24A08 100%)",
  "linear-gradient(135deg, #0E7490 0%, #0891B2 100%)",
  "linear-gradient(135deg, #B45309 0%, #D97706 100%)",
  "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)",
  "linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)",
];

const fmt = (amount) =>
  amount != null
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
    : "—";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const TourHistoryCard = ({ plan, index }) => {
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg fade-in-up"
      style={{ borderColor: "#E5DFD3", animationDelay: `${index * 0.06}s` }}
      data-testid={`history-card-${plan.plan_id}`}
    >
      {/* Gradient header */}
      <div
        className="h-36 flex flex-col justify-end px-5 pb-4 relative"
        style={{ background: gradient }}
      >
        {/* Day badge */}
        <div
          className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.2)", color: "#fff", backdropFilter: "blur(4px)" }}
        >
          {plan.days} Day{plan.days !== 1 ? "s" : ""}
        </div>

        <h3
          className="text-xl font-medium text-white leading-tight"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          {plan.destination}
        </h3>
        {plan.state_country && (
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            {plan.state_country}
          </p>
        )}
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Highlights */}
        {plan.highlights?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {plan.highlights.map((h) => (
              <span
                key={h}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background: "#E8F4FB", color: "#0E7490" }}
              >
                <Star size={9} fill="#D99C42" stroke="#D99C42" />
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Costs */}
        <div
          className="rounded-xl p-3 mb-4 space-y-2"
          style={{ background: "#FDF6EE", border: "1px solid #E0D4C0" }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: "#75837A" }}>Premium Plan</span>
            <span
              className="text-sm font-bold"
              style={{ color: "#0C3D20", fontFamily: "Outfit, sans-serif" }}
              data-testid={`card-premium-${plan.plan_id}`}
            >
              {fmt(plan.premium_total)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: "#75837A" }}>Budget Plan</span>
            <span
              className="text-sm font-bold"
              style={{ color: "#E8580A", fontFamily: "Outfit, sans-serif" }}
              data-testid={`card-budget-${plan.plan_id}`}
            >
              {fmt(plan.budget_total)}
            </span>
          </div>
        </div>

        {/* Date + View button */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#75837A" }}>
            {formatDate(plan.created_at)}
          </span>
          <Link
            to={`/?plan=${plan.plan_id}`}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: "#1C3325", color: "#fff", fontFamily: "Manrope, sans-serif" }}
            data-testid={`btn-view-plan-${plan.plan_id}`}
          >
            View Plan <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TourHistoryCard;

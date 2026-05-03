import React from "react";

const fmt = (amount) =>
  amount != null
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
    : "—";

const stars = (n) => "★".repeat(n || 0) + "☆".repeat(Math.max(0, 5 - (n || 0)));

const SectionHeading = ({ children }) => (
  <h3
    style={{
      margin: "0 0 12px",
      fontSize: "15px",
      color: "#1C3325",
      borderLeft: "4px solid #D96B42",
      paddingLeft: "10px",
      fontFamily: "Outfit, sans-serif",
    }}
  >
    {children}
  </h3>
);

const CostBox = ({ label, total, bg = "#D96B42" }) => (
  <div
    style={{
      background: bg,
      color: "#fff",
      borderRadius: "8px",
      padding: "10px 16px",
      textAlign: "center",
      marginTop: "12px",
    }}
  >
    <p style={{ margin: 0, fontSize: "11px", opacity: 0.8 }}>{label}</p>
    <p style={{ margin: "3px 0 0", fontSize: "22px", fontWeight: "bold", fontFamily: "Outfit, sans-serif" }}>
      {total}
    </p>
  </div>
);

const PlanSection = ({ plan, type }) => {
  const isPremium = type === "premium";
  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        style={{
          background: isPremium ? "#1C3325" : "#F2ECE4",
          color: isPremium ? "#fff" : "#1C3325",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "12px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px", fontFamily: "Outfit, sans-serif" }}>
          {isPremium ? "Premium Plan" : "Budget Plan"}
        </h3>
        <p style={{ margin: "3px 0 0", fontSize: "11px", opacity: 0.7 }}>
          {isPremium ? "3-4 Star Hotel + Sedan Car" : "Budget Hotel + Hatchback Car"}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {/* Hotel */}
        <div style={{ border: "1px solid #E5DFD3", borderRadius: "8px", padding: "12px" }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#75837A", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Accommodation
          </p>
          <p style={{ margin: "0 0 4px", fontWeight: "bold", fontSize: "13px", color: "#1C3325" }}>
            {plan?.hotel?.name}
          </p>
          <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#D99C42" }}>
            {stars(plan?.hotel?.stars)} &nbsp; Google: {plan?.hotel?.google_rating}/5
          </p>
          <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#4A5A50" }}>
            {plan?.hotel?.location}
          </p>
          <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#4A5A50" }}>
            Per night: {fmt(plan?.hotel?.price_per_night_inr)}
          </p>
          <p style={{ margin: "0", fontSize: "12px", fontWeight: "bold", color: "#1C3325" }}>
            Total stay: {fmt(plan?.hotel?.total_stay_cost_inr)}
          </p>
          {plan?.hotel?.amenities?.length > 0 && (
            <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#75837A" }}>
              {plan.hotel.amenities.join(" · ")}
            </p>
          )}
        </div>

        {/* Transport */}
        <div style={{ border: "1px solid #E5DFD3", borderRadius: "8px", padding: "12px" }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#75837A", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Transportation
          </p>
          <p style={{ margin: "0 0 4px", fontWeight: "bold", fontSize: "13px", color: "#1C3325" }}>
            {plan?.transport?.vehicle_type}
          </p>
          <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#4A5A50" }}>
            {plan?.transport?.recommended_models}
          </p>
          <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#4A5A50" }}>
            Per day: {fmt(plan?.transport?.price_per_day_inr)}
          </p>
          <p style={{ margin: "0", fontSize: "12px", fontWeight: "bold", color: "#1C3325" }}>
            Total transport: {fmt(plan?.transport?.total_transport_cost_inr)}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#75837A" }}>
            {plan?.transport?.includes_driver ? "Driver included" : "Self-drive"}
          </p>
        </div>
      </div>

      <CostBox
        label={`${isPremium ? "PREMIUM" : "BUDGET"} PLAN TOTAL (Stay + Transport)`}
        total={fmt(plan?.grand_total_inr)}
        bg={isPremium ? "#D96B42" : "#1C3325"}
      />
      {plan?.cost_notes && (
        <p style={{ margin: "6px 0 0", fontSize: "10px", color: "#75837A" }}>* {plan.cost_notes}</p>
      )}
    </div>
  );
};

const PrintableView = ({ tourData }) => {
  if (!tourData) return null;

  const {
    destination, state_country, duration_days, overview,
    best_time_to_visit, highlights, itinerary,
    premium_plan, budget_plan, travel_tips,
    estimated_total_food_cost_inr,
  } = tourData;

  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div id="printable-tour-plan">
      {/* Header */}
      <div style={{ borderBottom: "3px solid #1C3325", paddingBottom: "14px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", color: "#1C3325", fontFamily: "Outfit, sans-serif" }}>
              Plan &amp; Tour
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#75837A" }}>AI-Powered Travel Planning</p>
          </div>
          <p style={{ margin: 0, fontSize: "11px", color: "#75837A" }}>Generated: {today}</p>
        </div>
        <div style={{ marginTop: "12px" }}>
          <h2 style={{ margin: "0 0 3px", fontSize: "32px", color: "#D96B42", fontFamily: "Outfit, sans-serif" }}>
            {destination}
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#4A5A50" }}>
            {state_country} &nbsp;·&nbsp; {duration_days} Days &nbsp;·&nbsp; All prices in INR
          </p>
        </div>
      </div>

      {/* Overview */}
      <div style={{ marginBottom: "20px" }}>
        <SectionHeading>About {destination}</SectionHeading>
        <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#4A5A50", lineHeight: "1.6" }}>{overview}</p>
        <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#75837A" }}>
          Best time to visit: <strong style={{ color: "#1C3325" }}>{best_time_to_visit}</strong>
        </p>
        {highlights?.length > 0 && (
          <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#75837A" }}>
            Highlights: <strong style={{ color: "#1C3325" }}>{highlights.join(" · ")}</strong>
          </p>
        )}
        {estimated_total_food_cost_inr > 0 && (
          <p style={{ margin: 0, fontSize: "11px", color: "#75837A" }}>
            Estimated total food cost: <strong style={{ color: "#1C3325" }}>{fmt(estimated_total_food_cost_inr)}</strong>
          </p>
        )}
      </div>

      {/* Itinerary */}
      <div style={{ marginBottom: "20px" }}>
        <SectionHeading>Day-by-Day Itinerary</SectionHeading>
        {itinerary?.map((day) => (
          <div
            key={day.day}
            style={{ marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid #F2ECE4" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "7px" }}>
              <span
                style={{
                  width: "26px", height: "26px", borderRadius: "50%", background: "#D96B42",
                  color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "bold", flexShrink: 0,
                }}
              >
                {day.day}
              </span>
              <strong style={{ fontSize: "14px", color: "#1C3325", fontFamily: "Outfit, sans-serif" }}>
                {day.title}
              </strong>
            </div>
            {day.morning && (
              <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#4A5A50" }}>
                <strong style={{ color: "#75837A" }}>Morning: </strong>{day.morning}
              </p>
            )}
            {day.afternoon && (
              <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#4A5A50" }}>
                <strong style={{ color: "#75837A" }}>Afternoon: </strong>{day.afternoon}
              </p>
            )}
            {day.evening && (
              <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#4A5A50" }}>
                <strong style={{ color: "#75837A" }}>Evening: </strong>{day.evening}
              </p>
            )}
            {day.food_recommendation && (
              <p style={{ margin: "0 0 3px", fontSize: "11px", color: "#D96B42" }}>
                Food: {day.food_recommendation}
                {day.estimated_food_cost_inr ? ` · Est. ${fmt(day.estimated_food_cost_inr)}` : ""}
              </p>
            )}
            {day.places_visited?.length > 0 && (
              <p style={{ margin: 0, fontSize: "10px", color: "#75837A" }}>
                Places: {day.places_visited.join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Premium Plan — page break before */}
      <div style={{ pageBreakBefore: "always" }}>
        <PlanSection plan={premium_plan} type="premium" />
      </div>

      {/* Budget Plan */}
      <PlanSection plan={budget_plan} type="budget" />

      {/* Travel Tips */}
      {travel_tips?.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <SectionHeading>Travel Tips</SectionHeading>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {travel_tips.map((tip, i) => (
              <li key={i} style={{ fontSize: "12px", color: "#4A5A50", marginBottom: "4px" }}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          borderTop: "2px solid #E5DFD3",
          paddingTop: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: "10px", color: "#75837A" }}>Plan &amp; Tour · AI-Powered Travel Planning</p>
        <p style={{ margin: 0, fontSize: "10px", color: "#75837A" }}>All prices are approximate estimates in INR</p>
      </div>
    </div>
  );
};

export default PrintableView;

import React from "react";
import { Hotel, Car, Star, IndianRupee, CheckCircle, MapPin } from "lucide-react";

const formatINR = (amount) => {
  if (!amount && amount !== 0) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const StarRating = ({ rating, dark }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={13}
        fill={i < Math.round(rating || 0) ? "#D99C42" : "none"}
        stroke="#D99C42"
        strokeWidth={1.5}
      />
    ))}
    <span className="ml-1 text-xs font-semibold" style={{ color: dark ? "rgba(255,255,255,0.8)" : "#75837A" }}>
      {rating}
    </span>
  </div>
);

const HotelImageSection = ({ isPremium }) => (
  <div className="w-full h-40 rounded-xl overflow-hidden mb-5">
    <img
      src={
        isPremium
          ? "https://images.pexels.com/photos/18201945/pexels-photo-18201945.jpeg"
          : "https://images.unsplash.com/photo-1637149690800-41dea371493f?crop=entropy&cs=srgb&fm=jpg&q=80&w=600"
      }
      alt={isPremium ? "Premium Hotel" : "Budget Hotel"}
      className="w-full h-full object-cover"
    />
  </div>
);

const CostRow = ({ label, value, dark, large }) => (
  <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#F2ECE4"}` }}>
    <span className={`text-sm ${large ? "font-semibold" : ""}`} style={{ color: dark ? "rgba(255,255,255,0.75)" : "#4A5A50" }}>
      {label}
    </span>
    <span className={`font-bold ${large ? "text-lg" : "text-base"}`} style={{ color: dark ? "#D99C42" : "#1C3325" }}>
      {formatINR(value)}
    </span>
  </div>
);

const PlanCard = ({ plan, destination, duration, type }) => {
  if (!plan) return null;
  const isPremium = type === "premium";

  // Normalize: support new multi-hotel array OR legacy single hotel object
  const hotelsList = Array.isArray(plan.hotels) && plan.hotels.length > 0
    ? plan.hotels
    : plan.hotel
      ? [{
          city: plan.hotel.city || destination,
          name: plan.hotel.name,
          stars: plan.hotel.stars,
          google_rating: plan.hotel.google_rating,
          location: plan.hotel.location,
          price_per_night_inr: plan.hotel.price_per_night_inr,
          nights_stay: Math.max(0, (duration || 1) - 1),
          total_cost_inr: plan.hotel.total_stay_cost_inr,
          amenities: plan.hotel.amenities,
          why_recommended: plan.hotel.why_recommended,
        }]
      : [];
  const isMultiCity = hotelsList.length > 1;

  const cardBg = isPremium ? "#0C3D20" : "#FFFFFF";
  const textPrimary = isPremium ? "#FFFFFF" : "#1C3325";
  const textSecondary = isPremium ? "rgba(255,255,255,0.78)" : "#4A5A50";
  const tagBg = isPremium ? "rgba(255,255,255,0.14)" : "#E8F4FB";
  const tagText = isPremium ? "#fff" : "#0E7490";
  const sectionBg = isPremium ? "rgba(255,255,255,0.07)" : "#FDF6EE";
  const borderColor = isPremium ? "rgba(255,255,255,0.12)" : "#E0D4C0";

  return (
    <section
      className="py-16 px-4"
      style={{ background: isPremium ? "#EDE0CC" : "#FDF6EE" }}
      data-testid={`plan-section-${type}`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="text-xs tracking-[0.2em] uppercase font-bold mb-2"
            style={{ color: "#D96B42", fontFamily: "Manrope, sans-serif" }}
          >
            {isPremium ? "Premium Plan" : "Budget Plan"}
          </p>
          <h2
            className="text-3xl sm:text-4xl font-medium mb-3"
            style={{ color: "#1C3325", fontFamily: "Outfit, sans-serif" }}
          >
            {isPremium ? "Travel in Comfort & Style" : "Smart Travel, Great Value"}
          </h2>
          <p className="text-base" style={{ color: "#4A5A50" }}>
            {isPremium
              ? `3-4 Star Hotel + Sedan Car for your ${duration}-day trip to ${destination}`
              : `Budget Hotel + Hatchback Car for your ${duration}-day trip to ${destination}`}
          </p>
        </div>

        {/* Main card */}
        <div
          className="rounded-2xl p-7 sm:p-10 shadow-xl fade-in-up"
          style={{ background: cardBg, color: textPrimary }}
          data-testid={`card-${type}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hotel Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: isPremium ? "rgba(255,255,255,0.15)" : "#F2ECE4" }}
                >
                  <Hotel size={16} style={{ color: isPremium ? "#D99C42" : "#D96B42" }} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Accommodation{isMultiCity ? ` · ${hotelsList.length} Stays` : ""}
                </h3>
              </div>

              {!isMultiCity && <HotelImageSection isPremium={isPremium} />}

              <div className="space-y-5">
                {hotelsList.map((h, idx) => (
                  <div
                    key={idx}
                    data-testid={`hotel-entry-${type}-${idx}`}
                    style={
                      isMultiCity
                        ? {
                            background: sectionBg,
                            border: `1px solid ${borderColor}`,
                            borderRadius: "14px",
                            padding: "16px",
                          }
                        : {}
                    }
                  >
                    {isMultiCity && h.city && (
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
                          style={{
                            background: isPremium ? "#D99C42" : "#D96B42",
                            color: "#fff",
                            fontFamily: "Manrope, sans-serif",
                            letterSpacing: "0.05em",
                          }}
                        >
                          <MapPin size={11} /> {h.city}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: textSecondary }}>
                          · {h.nights_stay || 0} night{(h.nights_stay || 0) === 1 ? "" : "s"}
                        </span>
                      </div>
                    )}

                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-base font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>
                          {h.name}
                        </h4>
                        <div className="flex gap-0.5">
                          {Array.from({ length: h.stars || 0 }).map((_, i) => (
                            <Star key={i} size={11} fill="#D99C42" stroke="#D99C42" />
                          ))}
                        </div>
                      </div>
                      <StarRating rating={h.google_rating} dark={isPremium} />
                      {h.location && (
                        <div className="flex items-center gap-1 mt-2">
                          <MapPin size={12} style={{ color: isPremium ? "rgba(255,255,255,0.6)" : "#D96B42" }} />
                          <span className="text-xs" style={{ color: textSecondary }}>{h.location}</span>
                        </div>
                      )}
                    </div>

                    {h.why_recommended && (
                      <p
                        className="text-sm leading-relaxed mb-3 p-3 rounded-xl italic"
                        style={{ background: isMultiCity ? (isPremium ? "rgba(0,0,0,0.2)" : "#fff") : sectionBg, color: textSecondary }}
                      >
                        "{h.why_recommended}"
                      </p>
                    )}

                    {h.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {h.amenities.map((a, i) => (
                          <span
                            key={i}
                            className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
                            style={{ background: tagBg, color: tagText }}
                          >
                            <CheckCircle size={9} style={{ color: isPremium ? "#D99C42" : "#D96B42" }} />
                            {a}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className="rounded-xl p-3"
                      style={{
                        background: isMultiCity ? (isPremium ? "rgba(0,0,0,0.2)" : "#fff") : sectionBg,
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      <CostRow label="Per Night" value={h.price_per_night_inr} dark={isPremium} />
                      <CostRow
                        label={`${h.nights_stay || 0} night${(h.nights_stay || 0) === 1 ? "" : "s"} stay`}
                        value={h.total_cost_inr}
                        dark={isPremium}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transport Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: isPremium ? "rgba(255,255,255,0.15)" : "#F2ECE4" }}
                >
                  <Car size={16} style={{ color: isPremium ? "#D99C42" : "#D96B42" }} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Transportation
                </h3>
              </div>

              {/* Car image */}
              <div className="w-full h-40 rounded-xl overflow-hidden mb-5">
                <img
                  src="https://images.pexels.com/photos/800649/pexels-photo-800649.jpeg"
                  alt="Car"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mb-3">
                <div
                  className="text-xl font-bold mb-1 px-4 py-2 rounded-xl inline-block"
                  style={{ background: isPremium ? "rgba(217,155,66,0.2)" : "#FEF3C7", color: isPremium ? "#D99C42" : "#92400E", fontFamily: "Outfit, sans-serif" }}
                >
                  {plan.transport?.vehicle_type}
                </div>
              </div>

              <p className="text-sm mb-4 font-medium" style={{ color: textSecondary }}>
                {plan.transport?.recommended_models}
              </p>

              {plan.transport?.rental_suggestions && (
                <p className="text-sm leading-relaxed mb-4 p-3 rounded-xl italic"
                  style={{ background: sectionBg, color: textSecondary }}>
                  "{plan.transport.rental_suggestions}"
                </p>
              )}

              <div
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-full mb-4 w-fit"
                style={{ background: isPremium ? "rgba(255,255,255,0.12)" : "#DCFCE7", color: isPremium ? "#fff" : "#166534" }}
              >
                <CheckCircle size={12} />
                {plan.transport?.includes_driver ? "Driver Included" : "Self Drive"}
              </div>

              <div className="rounded-xl p-4" style={{ background: sectionBg, border: `1px solid ${borderColor}` }}>
                <CostRow label="Per Day" value={plan.transport?.price_per_day_inr} dark={isPremium} />
                <CostRow label={`Total Transport (${duration} days)`} value={plan.transport?.total_transport_cost_inr} dark={isPremium} />
              </div>
            </div>
          </div>

          {/* Grand Total */}
          <div
            className="mt-8 rounded-2xl p-6 text-center"
            style={{ background: isPremium ? "rgba(232,88,10,0.18)" : "#0C3D20", border: isPremium ? "1px solid rgba(232,88,10,0.35)" : "none" }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <IndianRupee size={16} style={{ color: isPremium ? "#E8580A" : "#FCD34D" }} strokeWidth={2} />
              <span
                className="text-xs tracking-[0.2em] uppercase font-bold"
                style={{ color: isPremium ? "#E8580A" : "rgba(255,255,255,0.7)", fontFamily: "Manrope, sans-serif" }}
              >
                Total Trip Cost (Stay + Travel)
              </span>
            </div>
            <p
              className="text-4xl sm:text-5xl font-bold"
              style={{ color: isPremium ? "#fff" : "#D99C42", fontFamily: "Outfit, sans-serif" }}
              data-testid={`total-cost-${type}`}
            >
              {formatINR(plan.grand_total_inr)}
            </p>
            {plan.cost_notes && (
              <p className="text-xs mt-2" style={{ color: isPremium ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.5)" }}>
                * {plan.cost_notes}
              </p>
            )}
          </div>

          {/* Cost breakdown */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: sectionBg, border: `1px solid ${borderColor}` }}
            >
              <p className="text-xs mb-1" style={{ color: textSecondary }}>Accommodation</p>
              <p className="text-lg font-bold" style={{ color: isPremium ? "#D99C42" : "#1C3325", fontFamily: "Outfit, sans-serif" }}>
                {formatINR(plan.total_stay_cost_inr)}
              </p>
            </div>
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: sectionBg, border: `1px solid ${borderColor}` }}
            >
              <p className="text-xs mb-1" style={{ color: textSecondary }}>Transportation</p>
              <p className="text-lg font-bold" style={{ color: isPremium ? "#D99C42" : "#1C3325", fontFamily: "Outfit, sans-serif" }}>
                {formatINR(plan.total_transport_cost_inr)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanCard;

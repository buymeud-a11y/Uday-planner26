import React from "react";
import { Star, MapPin, CheckCircle } from "lucide-react";

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

const CostRow = ({ label, value, dark, large }) => (
  <div
    className="flex items-center justify-between py-2"
    style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#F2ECE4"}` }}
  >
    <span
      className={`text-sm ${large ? "font-semibold" : ""}`}
      style={{ color: dark ? "rgba(255,255,255,0.75)" : "#4A5A50" }}
    >
      {label}
    </span>
    <span
      className={`font-bold ${large ? "text-lg" : "text-base"}`}
      style={{ color: dark ? "#D99C42" : "#1C3325" }}
    >
      {formatINR(value)}
    </span>
  </div>
);

const HotelItem = ({ hotel, type, isPremium, isMultiCity, index }) => {
  const textSecondary = isPremium ? "rgba(255,255,255,0.78)" : "#4A5A50";
  const tagBg = isPremium ? "rgba(255,255,255,0.14)" : "#E8F4FB";
  const tagText = isPremium ? "#fff" : "#0E7490";
  const sectionBg = isPremium ? "rgba(255,255,255,0.07)" : "#FDF6EE";
  const borderColor = isPremium ? "rgba(255,255,255,0.12)" : "#E0D4C0";
  const innerBg = isPremium ? "rgba(0,0,0,0.2)" : "#fff";

  const wrapperStyle = isMultiCity
    ? { background: sectionBg, border: `1px solid ${borderColor}`, borderRadius: "14px", padding: "16px" }
    : {};
  const innerBoxBg = isMultiCity ? innerBg : sectionBg;
  const nightsLabel = `${hotel.nights_stay || 0} night${(hotel.nights_stay || 0) === 1 ? "" : "s"}`;

  return (
    <div data-testid={`hotel-entry-${type}-${index}`} style={wrapperStyle}>
      {isMultiCity && hotel.city && (
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
            <MapPin size={11} /> {hotel.city}
          </span>
          <span className="text-xs font-semibold" style={{ color: textSecondary }}>
            · {nightsLabel}
          </span>
        </div>
      )}

      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-base font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>
            {hotel.name}
          </h4>
          <div className="flex gap-0.5">
            {Array.from({ length: hotel.stars || 0 }).map((_, i) => (
              <Star key={i} size={11} fill="#D99C42" stroke="#D99C42" />
            ))}
          </div>
        </div>
        <StarRating rating={hotel.google_rating} dark={isPremium} />
        {hotel.location && (
          <div className="flex items-center gap-1 mt-2">
            <MapPin size={12} style={{ color: isPremium ? "rgba(255,255,255,0.6)" : "#D96B42" }} />
            <span className="text-xs" style={{ color: textSecondary }}>{hotel.location}</span>
          </div>
        )}
      </div>

      {hotel.why_recommended && (
        <p
          className="text-sm leading-relaxed mb-3 p-3 rounded-xl italic"
          style={{ background: innerBoxBg, color: textSecondary }}
        >
          "{hotel.why_recommended}"
        </p>
      )}

      {hotel.amenities?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hotel.amenities.map((amenity) => (
            <span
              key={amenity}
              className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
              style={{ background: tagBg, color: tagText }}
            >
              <CheckCircle size={9} style={{ color: isPremium ? "#D99C42" : "#D96B42" }} />
              {amenity}
            </span>
          ))}
        </div>
      )}

      <div
        className="rounded-xl p-3"
        style={{ background: innerBoxBg, border: `1px solid ${borderColor}` }}
      >
        <CostRow label="Per Night" value={hotel.price_per_night_inr} dark={isPremium} />
        <CostRow label={`${nightsLabel} stay`} value={hotel.total_cost_inr} dark={isPremium} />
      </div>
    </div>
  );
};

export { StarRating, CostRow, formatINR };
export default HotelItem;

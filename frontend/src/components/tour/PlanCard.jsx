import React from "react";
import { Hotel, Car, CheckCircle, IndianRupee } from "lucide-react";
import HotelItem, { CostRow, formatINR } from "./HotelItem";

const HotelImageSection = ({ isPremium }) => {
  const src = isPremium
    ? "https://images.pexels.com/photos/18201945/pexels-photo-18201945.jpeg"
    : "https://images.unsplash.com/photo-1637149690800-41dea371493f?crop=entropy&cs=srgb&fm=jpg&q=80&w=600";
  const alt = isPremium ? "Premium Hotel" : "Budget Hotel";
  return (
    <div className="w-full h-40 rounded-xl overflow-hidden mb-5">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};

// Normalize hotels: supports new `hotels[]` array or legacy single `hotel` object
const normalizeHotels = (plan, destination, duration) => {
  if (Array.isArray(plan.hotels) && plan.hotels.length > 0) {
    return plan.hotels;
  }
  if (!plan.hotel) return [];
  return [{
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
  }];
};

const hotelKey = (hotel, idx) => `${hotel.city || "stay"}-${hotel.name || idx}`;

const HotelSection = ({ hotels, isMultiCity, isPremium, type }) => {
  const iconBg = isPremium ? "rgba(255,255,255,0.15)" : "#F2ECE4";
  const iconColor = isPremium ? "#D99C42" : "#D96B42";
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          <Hotel size={16} style={{ color: iconColor }} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-medium" style={{ fontFamily: "Outfit, sans-serif" }}>
          Accommodation{isMultiCity ? ` · ${hotels.length} Stays` : ""}
        </h3>
      </div>
      {!isMultiCity && <HotelImageSection isPremium={isPremium} />}
      <div className="space-y-5">
        {hotels.map((hotel, idx) => (
          <HotelItem
            key={hotelKey(hotel, idx)}
            hotel={hotel}
            type={type}
            isPremium={isPremium}
            isMultiCity={isMultiCity}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
};

const TransportSection = ({ transport, duration, isPremium }) => {
  const iconBg = isPremium ? "rgba(255,255,255,0.15)" : "#F2ECE4";
  const iconColor = isPremium ? "#D99C42" : "#D96B42";
  const textSecondary = isPremium ? "rgba(255,255,255,0.78)" : "#4A5A50";
  const sectionBg = isPremium ? "rgba(255,255,255,0.07)" : "#FDF6EE";
  const borderColor = isPremium ? "rgba(255,255,255,0.12)" : "#E0D4C0";
  const vehicleBg = isPremium ? "rgba(217,155,66,0.2)" : "#FEF3C7";
  const vehicleText = isPremium ? "#D99C42" : "#92400E";
  const driverBg = isPremium ? "rgba(255,255,255,0.12)" : "#DCFCE7";
  const driverText = isPremium ? "#fff" : "#166534";

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          <Car size={16} style={{ color: iconColor }} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-medium" style={{ fontFamily: "Outfit, sans-serif" }}>
          Transportation
        </h3>
      </div>

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
          style={{ background: vehicleBg, color: vehicleText, fontFamily: "Outfit, sans-serif" }}
        >
          {transport?.vehicle_type}
        </div>
      </div>

      <p className="text-sm mb-4 font-medium" style={{ color: textSecondary }}>
        {transport?.recommended_models}
      </p>

      {transport?.rental_suggestions && (
        <p className="text-sm leading-relaxed mb-4 p-3 rounded-xl italic" style={{ background: sectionBg, color: textSecondary }}>
          "{transport.rental_suggestions}"
        </p>
      )}

      <div
        className="flex items-center gap-2 text-xs px-3 py-2 rounded-full mb-4 w-fit"
        style={{ background: driverBg, color: driverText }}
      >
        <CheckCircle size={12} />
        {transport?.includes_driver ? "Driver Included" : "Self Drive"}
      </div>

      <div className="rounded-xl p-4" style={{ background: sectionBg, border: `1px solid ${borderColor}` }}>
        <CostRow label="Per Day" value={transport?.price_per_day_inr} dark={isPremium} />
        <CostRow label={`Total Transport (${duration} days)`} value={transport?.total_transport_cost_inr} dark={isPremium} />
      </div>
    </div>
  );
};

const PlanCard = ({ plan, destination, duration, type }) => {
  if (!plan) return null;
  const isPremium = type === "premium";

  const hotelsList = normalizeHotels(plan, destination, duration);
  const isMultiCity = hotelsList.length > 1;

  const cardBg = isPremium ? "#0C3D20" : "#FFFFFF";
  const textPrimary = isPremium ? "#FFFFFF" : "#1C3325";
  const textSecondary = isPremium ? "rgba(255,255,255,0.78)" : "#4A5A50";
  const sectionBg = isPremium ? "rgba(255,255,255,0.07)" : "#FDF6EE";
  const borderColor = isPremium ? "rgba(255,255,255,0.12)" : "#E0D4C0";
  const pageBg = isPremium ? "#EDE0CC" : "#FDF6EE";

  const totalBoxBg = isPremium ? "rgba(232,88,10,0.18)" : "#0C3D20";
  const totalBoxBorder = isPremium ? "1px solid rgba(232,88,10,0.35)" : "none";
  const rupeeColor = isPremium ? "#E8580A" : "#FCD34D";
  const totalLabelColor = isPremium ? "#E8580A" : "rgba(255,255,255,0.7)";
  const totalValueColor = isPremium ? "#fff" : "#D99C42";
  const costNoteColor = "rgba(255,255,255,0.5)";

  const breakdownValueColor = isPremium ? "#D99C42" : "#1C3325";

  return (
    <section
      className="py-16 px-4"
      style={{ background: pageBg }}
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
            <HotelSection hotels={hotelsList} isMultiCity={isMultiCity} isPremium={isPremium} type={type} />
            <TransportSection transport={plan.transport} duration={duration} isPremium={isPremium} />
          </div>

          {/* Grand Total */}
          <div
            className="mt-8 rounded-2xl p-6 text-center"
            style={{ background: totalBoxBg, border: totalBoxBorder }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <IndianRupee size={16} style={{ color: rupeeColor }} strokeWidth={2} />
              <span
                className="text-xs tracking-[0.2em] uppercase font-bold"
                style={{ color: totalLabelColor, fontFamily: "Manrope, sans-serif" }}
              >
                Total Trip Cost (Stay + Travel)
              </span>
            </div>
            <p
              className="text-4xl sm:text-5xl font-bold"
              style={{ color: totalValueColor, fontFamily: "Outfit, sans-serif" }}
              data-testid={`total-cost-${type}`}
            >
              {formatINR(plan.grand_total_inr)}
            </p>
            {plan.cost_notes && (
              <p className="text-xs mt-2" style={{ color: costNoteColor }}>
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
              <p className="text-lg font-bold" style={{ color: breakdownValueColor, fontFamily: "Outfit, sans-serif" }}>
                {formatINR(plan.total_stay_cost_inr)}
              </p>
            </div>
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: sectionBg, border: `1px solid ${borderColor}` }}
            >
              <p className="text-xs mb-1" style={{ color: textSecondary }}>Transportation</p>
              <p className="text-lg font-bold" style={{ color: breakdownValueColor, fontFamily: "Outfit, sans-serif" }}>
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

import React, { useState } from "react";

// PUBLIC_INTERFACE
/**
 * HousesData - City-to-Astrological Houses component.
 * Flow: User provides city → lookup geo-details (lat, long, timezone) via API →
 *      use current date+time and those details to fetch houses endpoint → display.
 */
function HousesData() {
  // User city for lookup
  const [city, setCity] = useState("");
  // Internal state for API fetched geo-details
  const [geodetails, setGeodetails] = useState(null);
  // Houses data (final result)
  const [houses, setHouses] = useState(null);
  // Loading and error states for UI feedback
  const [geoLoading, setGeoLoading] = useState(false);
  const [housesLoading, setHousesLoading] = useState(false);
  const [error, setError] = useState(null);

  // PUBLIC_INTERFACE
  /**
   * Handles the submission:
   * 1. Calls geo-details API with user-input city.
   * 2. On geo-details success, calls houses endpoint with those details + current date/time.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setGeodetails(null);
    setHouses(null);

    // Basic validation
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }
    setGeoLoading(true);

    try {
      // 1. Call geo-details API (replace with actual endpoint as needed)
      // Here we mock the endpoint as /api/geo-details?city=<city>
      const geoRes = await fetch(
        `/api/geo-details?city=${encodeURIComponent(city.trim())}`
      );
      if (!geoRes.ok) throw new Error("Failed to lookup city geo-details.");
      const geo = await geoRes.json();
      if (!geo.latitude || !geo.longitude || !geo.timezone) {
        throw new Error("Geo-details not available for this city.");
      }
      setGeodetails(geo);
      setGeoLoading(false);

      setHousesLoading(true);

      // Compose ISO timestamp in the target timezone (approximate: use current UTC for demo)
      // In real implementation: get local time for that timezone. Here for demo: use current UTC
      const currentDateTime = new Date().toISOString();

      // 2. Call houses API (replace endpoint as needed)
      // Example: /api/houses?lat=...&lon=...&tz=...&datetime=...
      const housesUrl = `/api/houses?lat=${geo.latitude}&lon=${geo.longitude}&tz=${encodeURIComponent(
        geo.timezone
      )}&datetime=${encodeURIComponent(currentDateTime)}`;

      const housesRes = await fetch(housesUrl);
      if (!housesRes.ok) throw new Error("Failed to get houses data.");
      const housesData = await housesRes.json();
      setHouses(housesData);
      setHousesLoading(false);
    } catch (err) {
      setError(
        err?.message ||
          "Something went wrong while fetching astrological houses."
      );
      setGeoLoading(false);
      setHousesLoading(false);
    }
  };

  return (
    <div
      className="houses-data-card"
      style={{
        background: "rgba(30,33,55,0.91)",
        borderRadius: "18px",
        boxShadow: "0 2px 17px #f4d35e11",
        maxWidth: 380,
        margin: "24px auto",
        padding: "22px 13px",
        color: "#FFECC7",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: "1.2rem",
          marginBottom: 9,
          color: "#F4D35E",
          letterSpacing: "0.08em",
        }}
      >
        Astrological Houses Calculator (City-based)
      </div>
      <form
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
        onSubmit={handleSubmit}
      >
        <label>
          City:&nbsp;
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              width: 180,
              background: "#191b2a",
              color: "#F4D35E",
              border: "1.1px solid #28529f",
              borderRadius: 5,
              padding: "4px 10px",
            }}
            placeholder="e.g. San Francisco"
            aria-label="Enter city"
            autoComplete="address-level2"
          />
        </label>
        <button
          type="submit"
          style={{
            background: "#F4D35E",
            color: "#18243f",
            border: "none",
            borderRadius: 4,
            fontWeight: 600,
            padding: "7px 17px",
            marginTop: 3,
            cursor: "pointer",
          }}
          disabled={geoLoading || housesLoading}
        >
          {geoLoading
            ? "Looking up city…"
            : housesLoading
            ? "Calculating houses…"
            : "Calculate Houses"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: 10,
            color: "#E85E45",
            background: "#20040444",
            borderRadius: 6,
            padding: "7px 10px",
            fontWeight: 500,
            fontSize: "1.02rem",
          }}
        >
          {error}
        </div>
      )}

      {geodetails && (
        <div
          style={{
            marginTop: 14,
            color: "#FAEDCD",
            fontSize: "1.07rem",
            borderTop: "1px solid #28529f",
            paddingTop: 7,
            lineHeight: 1.5,
          }}
        >
          <div>
            <b>
              {city.trim()}:
              &nbsp;Lat {geodetails.latitude}, Lon {geodetails.longitude}
            </b>
          </div>
          <div>
            <span>Timezone: {geodetails.timezone}</span>
          </div>
        </div>
      )}

      {housesLoading && (
        <div style={{ marginTop: 12, color: "#28529f" }}>Computing houses…</div>
      )}

      {houses && !housesLoading && (
        <div
          style={{
            marginTop: 16,
            borderTop: "1.2px solid #28529f",
            paddingTop: 10,
            color: "#FAEDCD",
            fontSize: "1.01rem",
          }}
        >
          {/* Example structure: adapt as per actual API! */}
          {houses.house1 && (
            <div>
              <b>House I:</b> {houses.house1}
            </div>
          )}
          {houses.house2 && (
            <div>
              <b>House II:</b> {houses.house2}
            </div>
          )}
          {houses.house3 && (
            <div>
              <b>House III:</b> {houses.house3}
            </div>
          )}
          {/* Show other house fields if present */}
          {Object.keys(houses)
            .filter((k) => k.startsWith("house") && !["house1", "house2", "house3"].includes(k))
            .map((k) => (
              <div key={k}>
                <b>
                  {k.replace("house", "House ")}:
                </b>{" "}
                {houses[k]}
              </div>
            ))}
          {houses.note && (
            <div
              style={{
                marginTop: 6,
                color: "#F4D35E",
                opacity: 0.7,
                fontSize: ".96rem",
              }}
            >
              {houses.note}
            </div>
          )}
        </div>
      )}

      {/* Helpful hint: */}
      {!geoLoading && !housesLoading && !houses && !error && (
        <div
          style={{
            marginTop: 16,
            color: "#728ab7",
            fontSize: "0.98rem",
            opacity: 0.7,
          }}
        >
          Enter a city, e.g. "London" or "Tokyo", to see real house calculation for that locale and this moment.
        </div>
      )}
    </div>
  );
}

export default HousesData;

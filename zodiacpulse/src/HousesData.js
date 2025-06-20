import React, { useState } from "react";
import axios from "axios";

// PUBLIC_INTERFACE
/**
 * HousesData - City-based Astrological Houses Finder.
 * User enters a city name, which is looked up via ipgeolocation.io API to get coordinates and timezone;
 * Then the FreeAstrologyAPI western/houses endpoint is called using these details.
 * Loading, error, and success states are handled. Only city input is shown.
 */
function HousesData() {
  const [city, setCity] = useState("");
  const [inputTouched, setInputTouched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [houses, setHouses] = useState(null);
  const [location, setLocation] = useState(null); // {lat, lon, timezone}

  // Your API KEYS and ENDPOINTS -
  // Placeholders; replace with values from your latest code, if not accurate.
  const IPGEO_API_KEY = "545b3db049584f37982475a1b029fb92"; // use your actual API key
  const IPGEO_ENDPOINT = "https://api.ipgeolocation.io/timezone";
  const ASTRO_API_KEY = "0d72cb2fa2ac14bee854efc0aade164f"; // use your actual API key
  const ASTRO_API_ENDPOINT = "https://json.freeastrologyapi.com/western/houses";

  // Handles the city form submission
  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setInputTouched(true);
    setLoading(true);
    setError("");
    setHouses(null);
    setLocation(null);

    if (!city.trim()) {
      setLoading(false);
      setError("Please enter a city name.");
      return;
    }

    // Step 1: Fetch geolocation data for the city
    let geoData;
    try {
      // ipgeolocation.io allows location search by city name (with API key)
      // e.g. https://api.ipgeolocation.io/timezone?apiKey=API_KEY&location=London
      // The response includes timezone, latitude, longitude
      const geoUrl = `${IPGEO_ENDPOINT}?apiKey=${IPGEO_API_KEY}&location=${encodeURIComponent(city.trim())}`;
      const response = await axios.get(geoUrl);
      geoData = response.data;
      if (
        !geoData ||
        !geoData.latitude ||
        !geoData.longitude ||
        !geoData.timezone
      ) {
        throw new Error("Could not find city location or timezone.");
      }
      setLocation({
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        timezone: geoData.timezone,
        geoName: geoData.geo || city.trim(),
      });
    } catch (err) {
      setError(
        "Unable to find location data for this city. Please check the city name and try again."
      );
      setLoading(false);
      return;
    }

    // Step 2: Compute date/time (use current in user's timezone)
    // We get the city's timezone; create now in that tz if possible
    let datetimeIso = "";
    try {
      // We'll use Intl.DateTimeFormat to get the current datetime in the target timezone
      // and convert it to ISO string. Fallback to UTC if not possible.
      // timeZone property may not be supported by all browsers, so fallback gracefully
      const tz = geoData.timezone || "UTC";
      const now = new Date();
      let tzTime;
      // Try to convert to tz by formatting and reconstructing
      if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
        const fmt = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: tz,
        });
        // We get a format, but need to recompose into ISO
        const parts = fmt.formatToParts(now);
        const part = (k) =>
          parts.find((p) => p.type === k)?.value.padStart(2, "0");
        const year = part("year");
        const month = part("month");
        const day = part("day");
        const hour = part("hour");
        const minute = part("minute");
        const second = part("second");
        if (year && month && day && hour && minute && second) {
          tzTime = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
        } else {
          tzTime = now.toISOString().slice(0, 19); // UTC fallback
        }
      } else {
        tzTime = now.toISOString().slice(0, 19);
      }
      datetimeIso = tzTime;
    } catch {
      datetimeIso = new Date().toISOString().slice(0, 19);
    }

    // Step 3: Call astrology houses API (POST with correct auth)
    try {
      setLoading(true);

      // The Western Houses API expects:
      // POST request with JSON body:
      // {
      //   "date": "YYYY-MM-DD",
      //   "time": "HH:MM",
      //   "latitude": 12.9716,
      //   "longitude": 77.5946,
      //   "timezone": "Asia/Kolkata"
      // }
      // See https://freeastrologyapi.com/docs/western-houses

      // Parse datetime into date and time
      const [ymd, hms] = datetimeIso.split("T");
      const [hh, mm] = (hms || "00:00:00").split(":");

      const payload = {
        date: ymd,
        time: `${hh}:${mm}`,
        latitude: +geoData.latitude,
        longitude: +geoData.longitude,
        timezone: geoData.timezone,
      };

      const resp = await axios.post(
        ASTRO_API_ENDPOINT,
        payload,
        {
          headers: {
            "Authorization": `Token ${ASTRO_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (resp && resp.data) {
        setHouses(resp.data);
        setError("");
      } else {
        throw new Error("No data received from astrology API.");
      }
    } catch (err) {
      setError(
        "Failed to fetch astrological houses for this city. Please try again later."
      );
      setHouses(null);
    } finally {
      setLoading(false);
    }
  }

  // UI rendering
  return (
    <div
      className="houses-auto-card"
      style={{
        background: "rgba(30,33,55,0.93)",
        borderRadius: "18px",
        boxShadow: "0 2px 17px #f4d35e11",
        maxWidth: 380,
        margin: "26px auto 0 auto",
        padding: "22px 14px 18px 14px",
        color: "#FFECC7",
        fontFamily: "inherit",
        minHeight: 140,
        textAlign: "center"
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: "1.15rem",
          marginBottom: 9,
          color: "#F4D35E",
          letterSpacing: "0.07em",
        }}
      >
        Astrological Houses by City
      </div>
      {/* City input form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 16,
          alignItems: "center"
        }}
        aria-label="Astrological Houses Query Form"
      >
        <label htmlFor="city-input" style={{ color: "#F4D35E", fontWeight: 500, marginBottom: 3, fontSize: ".99rem" }}>
          Enter City Name:
        </label>
        <input
          id="city-input"
          name="city"
          type="text"
          placeholder="e.g., London"
          value={city}
          onChange={e => {setCity(e.target.value); setInputTouched(true); setError("");}}
          style={{
            width: "74%",
            borderRadius: 6,
            padding: "7px 11px",
            fontSize: "1.04rem",
            border: "1.4px solid #28529f",
            background: "#121b32",
            color: "#F4D35E",
            outline: "none"
          }}
          autoComplete="off"
          required
          aria-label="City name"
        />
        <button
          type="submit"
          style={{
            background: "#F4D35E",
            color: "#18243f",
            borderRadius: 4,
            border: "none",
            fontWeight: 600,
            padding: "7px 18px",
            cursor: "pointer",
            fontSize: "1.07rem",
            marginTop: 3
          }}
        >
          {loading ? <Spinner /> : "Show Houses"}
        </button>
      </form>
      {/* Feedback / errors / loading */}
      {error && (
        <div style={{
          color: "#E85E45", background: "#20111133", borderRadius: 7,
          fontWeight: 500, padding: "8px 5px 7px 5px", marginTop: 6, marginBottom: 2, fontSize: "1.03rem"
        }}>
          <span style={{ fontWeight: 600 }}>Error:</span> {error}
        </div>
      )}

      {/* Loading indication (below form) */}
      {loading && (
        <div style={{ color: "#F4D35E", padding: "11px 0", fontWeight: 500 }}>
          <Spinner />&nbsp;Loading data...
        </div>
      )}

      {/* Success: Show house data */}
      {houses && !loading && (
        <>
          <div style={{
            borderBottom: "1px solid #28529f77", paddingBottom: 6, marginBottom: 8,
            marginTop: 3
          }}>
            <div>
              <span style={{ color: "#F4D35E" }}>
                {location?.geoName || city} | {location?.timezone}
              </span>
            </div>
            <span style={{ color: "#9cd6e6", fontSize: "0.98rem" }}>
              ({location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)})
            </span>
          </div>
          <div>
            {Object.keys(houses)
              .filter((k) => k.toLowerCase().startsWith("house"))
              .sort((a, b) => {
                // e.g., 'house1', 'house2'... sort numerically
                const nA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
                const nB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
                return nA - nB;
              })
              .map((k) => (
                <div key={k} style={{marginBottom:3, fontSize:"1.04rem"}}>
                  <b>{k.replace(/(house)(\d+)/i, "House $2")}:</b> {houses[k]}
                </div>
              ))}
            {houses.note && (
              <div style={{
                marginTop: 6,
                color: "#F4D35E",
                opacity: 0.7,
                fontSize: ".99rem",
              }}>
                {houses.note}
              </div>
            )}
          </div>
          <div style={{
            color: "#728ab7", fontSize: "0.95rem",
            opacity: 0.62, marginTop: 7,
          }}>
            Astrological houses are calculated for this city (current moment).
          </div>
        </>
      )}

      {/* Helper text for initial state */}
      {!houses && !loading && !error && !inputTouched && (
        <div style={{
          color: "#728ab7",
          fontSize: "1.01rem",
          marginTop: 3,
          opacity: 0.87,
        }}>
          <span>Enter a city to see its current astrological houses.</span>
        </div>
      )}

      {/* No results */}
      {!houses && !loading && inputTouched && !error && (
        <div style={{
          color: "#728ab7",
          fontSize: "1.01rem",
          marginTop: 3,
          opacity: 0.87,
        }}>
          {city.trim() ? "No data available for this city (try another)." : ""}
        </div>
      )}
    </div>
  );
}


// Small accent spinner component
// PUBLIC_INTERFACE
function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        margin: "0 5px 0 0",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          display: "inline-block",
          border: "3px solid #f4d35e99",
          borderTop: "3px solid #28529f",
          borderRadius: "50%",
          animation: "spinner-rotate 0.8s linear infinite",
          marginBottom: -4,
        }}
      ></span>
      <style>
        {`
        @keyframes spinner-rotate {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        `}
      </style>
    </span>
  );
}

export default HousesData;

import React, { useState } from "react";
import axios from "axios";

/**
 * HousesData - Highly Minimal Astrological Houses & Natal Wheel Viewer.
 * Only latitude, longitude, and date are input. API call uses current device time.
 * Shows houses and natal chart. Handles loading/errors. Extremely minimal/clear UI.
 */
// PUBLIC_INTERFACE
function HousesData() {
  // Only kept inputs
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [date, setDate] = useState("");
  const [inputTouched, setInputTouched] = useState(false);

  // States for API loading/data/errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [houses, setHouses] = useState(null);

  // Natal wheel chart image state
  const [wheelUrl, setWheelUrl] = useState("");
  const [wheelLoading, setWheelLoading] = useState(false);
  const [wheelError, setWheelError] = useState("");

  // API info
  const ASTRO_API_KEY = "0d72cb2fa2ac14bee854efc0aade164f";
  const HOUSES_ENDPOINT = "https://json.freeastrologyapi.com/western/houses";
  const WHEEL_ENDPOINT = "https://json.freeastrologyapi.com/western/wheel";

  // Helpers for simple validation
  function validNumber(val, min, max) {
    if (typeof val !== "string" || val.trim() === "") return false;
    const num = Number(val);
    return !isNaN(num) && num >= min && num <= max;
  }
  function validDateString(d) {
    if (!d || typeof d !== "string") return false;
    const dateObj = new Date(d);
    if (isNaN(dateObj)) return false;
    const year = dateObj.getFullYear();
    return year >= 1600 && year <= 2100;
  }
  function allRequiredFields() {
    return (
      validNumber(latitude, -90, 90) &&
      validNumber(longitude, -180, 180) &&
      validDateString(date)
    );
  }

  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setInputTouched(true);
    setHouses(null);
    setError("");
    setWheelError("");
    setWheelUrl("");

    // Validation
    if (!allRequiredFields()) {
      setError(
        "Enter valid latitude (-90~90), longitude (-180~180), and date (1600-2100)."
      );
      return;
    }

    setLoading(true);
    setWheelLoading(true);

    // Use device time (closest to submit)
    const now = new Date();
    const y = date.substring(0, 4);
    const m = date.substring(5, 7);
    const d = date.substring(8, 10);
    const h = now.getHours().toString().padStart(2, "0");
    const n = now.getMinutes().toString().padStart(2, "0");
    const s = now.getSeconds().toString().padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    const timeStr = `${h}:${n}:${s}`;
    const timezone = (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      } catch {
        return "UTC";
      }
    })();
    const payload = {
      date: dateStr,
      time: timeStr,
      latitude: Number(latitude),
      longitude: Number(longitude),
      timezone: timezone,
      house_system: "placidus",
    };

    // Parallel fetches
    let housesResp = null,
      housesErr = "",
      wheelResp = null,
      wheelErr = "";

    const housesPromise = axios
      .post(HOUSES_ENDPOINT, payload, {
        headers: {
          Authorization: `Token ${ASTRO_API_KEY}`,
          "Content-Type": "application/json",
        },
      })
      .then((r) => (housesResp = r.data))
      .catch(() => (housesErr = "Failed to fetch houses."));

    const wheelPromise = axios
      .post(
        WHEEL_ENDPOINT,
        { ...payload, chart_type: "natal" },
        {
          headers: {
            Authorization: `Token ${ASTRO_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((r) => {
        // Prefer url, otherwise base64 "image"
        if (r.data.url) wheelResp = r.data.url;
        else if (r.data.image)
          wheelResp = "data:image/png;base64," + r.data.image;
        else wheelErr = "No wheel image returned.";
      })
      .catch(() => (wheelErr = "Failed to fetch natal wheel."));

    await Promise.all([housesPromise, wheelPromise]);
    setLoading(false);
    setWheelLoading(false);

    // Handle house results
    if (housesErr) {
      setError(housesErr);
      setHouses(null);
    } else {
      setHouses(housesResp);
    }
    // Wheel chart
    if (wheelErr) {
      setWheelError(wheelErr);
      setWheelUrl("");
    } else {
      setWheelUrl(wheelResp);
    }
  }

  // Clean, minimal fields
  return (
    <div
      style={{
        background: "rgba(30,33,55,0.94)",
        borderRadius: 14,
        maxWidth: 370,
        margin: "38px auto 0 auto",
        padding: "18px 14px 15px 14px",
        color: "#FFECC7",
        minHeight: 126,
        boxShadow: "0 2px 14px #f4d35e18",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: "1.04rem",
          marginBottom: 10,
          color: "#F4D35E",
        }}
      >
        Astrological Houses & Natal Wheel{" "}
        <span style={{ color: "#9cd6e6" }}>[Simple]</span>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 11,
          marginBottom: 10,
          alignItems: "center",
          width: "100%",
        }}
        aria-label="Astrological Houses Query Form"
      >
        {/* Latitude */}
        <div style={{ width: "100%", marginBottom: 6 }}>
          <label
            style={{
              color: "#F4D35E",
              fontWeight: 500,
              fontSize: ".97rem",
              marginBottom: 2,
              display: "block",
            }}
            htmlFor="latitude"
          >
            Latitude
          </label>
          <input
            name="latitude"
            id="latitude"
            type="number"
            value={latitude}
            onChange={(e) => {
              setLatitude(e.target.value);
              setInputTouched(true);
              setError(""); setWheelError(""); setHouses(null); setWheelUrl("");
            }}
            placeholder="e.g., 40.7128"
            style={inputStyle()}
            min={-90}
            max={90}
            step="any"
            autoComplete="off"
            aria-label="Latitude"
            required
          />
        </div>
        {/* Longitude */}
        <div style={{ width: "100%", marginBottom: 6 }}>
          <label
            style={{
              color: "#F4D35E",
              fontWeight: 500,
              fontSize: ".97rem",
              marginBottom: 2,
              display: "block",
            }}
            htmlFor="longitude"
          >
            Longitude
          </label>
          <input
            name="longitude"
            id="longitude"
            type="number"
            value={longitude}
            onChange={(e) => {
              setLongitude(e.target.value);
              setInputTouched(true);
              setError(""); setWheelError(""); setHouses(null); setWheelUrl("");
            }}
            placeholder="e.g., -74.0060"
            style={inputStyle()}
            min={-180}
            max={180}
            step="any"
            autoComplete="off"
            aria-label="Longitude"
            required
          />
        </div>
        {/* Date */}
        <div style={{ width: "100%", marginBottom: 1 }}>
          <label
            style={{
              color: "#F4D35E",
              fontWeight: 500,
              fontSize: ".97rem",
              marginBottom: 2,
              display: "block",
            }}
            htmlFor="date"
          >
            Date
          </label>
          <input
            name="date"
            id="date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setInputTouched(true);
              setError(""); setWheelError(""); setHouses(null); setWheelUrl("");
            }}
            min="1600-01-01"
            max="2100-12-31"
            style={inputStyle()}
            aria-label="Date"
            required
          />
        </div>
        <button
          type="submit"
          style={{
            background: "#F4D35E",
            color: "#18243f",
            borderRadius: 4,
            border: "none",
            fontWeight: 600,
            padding: "7px 16px",
            cursor: "pointer",
            fontSize: "1.03rem",
            marginTop: 10,
            minWidth: 100,
          }}
        >
          {loading ? <Spinner /> : "Show Houses"}
        </button>
      </form>

      {/* Feedback & Results */}
      {error && (
        <div
          style={{
            color: "#E85E45",
            background: "#28182633",
            borderRadius: 7,
            padding: "8px 4px 7px 4px",
            marginTop: 8,
            marginBottom: 2,
            fontSize: "1.01rem",
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}
      {(loading || wheelLoading) && (
        <div style={{ color: "#F4D35E", padding: "10px 0", fontWeight: 500 }}>
          <Spinner /> Loading...
        </div>
      )}
      {/* Display result: chart & houses */}
      {houses && !loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "14px 0 4px 0",
            gap: 10,
          }}
        >
          <div
            style={{
              borderBottom: "1px solid #28529f40",
              paddingBottom: 5,
              marginBottom: 8,
              marginTop: 2,
              color: "#9cd6e6",
              fontSize: "0.93rem",
            }}
          >
            Houses for {latitude}, {longitude} | {date}
            <br />
            (Current time:{" "}
            {(() => {
              const now = new Date();
              return (
                now
                  .getHours()
                  .toString()
                  .padStart(2, "0") +
                ":" +
                now
                  .getMinutes()
                  .toString()
                  .padStart(2, "0") +
                ":" +
                now
                  .getSeconds()
                  .toString()
                  .padStart(2, "0")
              );
            })()}
            , {Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"})
          </div>
          <div
            style={{
              display: "flex",
              gap: "18px",
              justifyContent: "center",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <div
              style={{
                minWidth: 120,
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingRight: 4,
              }}
            >
              {wheelLoading && (
                <div style={{ color: "#F4D35E", padding: "8px 0" }}>
                  <Spinner /> Loading chart...
                </div>
              )}
              {wheelError && (
                <div
                  style={{
                    color: "#E85E45",
                    background: "#28182633",
                    borderRadius: 7,
                    fontWeight: 500,
                    padding: "7px 6px 7px 6px",
                    marginBottom: 2,
                    fontSize: "0.97rem",
                  }}
                >
                  {wheelError}
                </div>
              )}
              {wheelUrl && (
                <img
                  src={wheelUrl}
                  alt="Natal Chart Wheel"
                  style={{
                    borderRadius: "11px",
                    border: "2.2px solid #28529f",
                    boxShadow: "0 2px 15px #28529f18",
                    maxWidth: 148,
                    maxHeight: 148,
                    width: "auto",
                    height: "auto",
                    background: "#181e32",
                  }}
                />
              )}
            </div>
            <div>
              {Object.keys(houses)
                .filter((k) => k.toLowerCase().startsWith("house"))
                .sort((a, b) => {
                  const nA = parseInt(a.replace(/[^0-9]/g, "")) || 0;
                  const nB = parseInt(b.replace(/[^0-9]/g, "")) || 0;
                  return nA - nB;
                })
                .map((k) => (
                  <div key={k} style={{ marginBottom: 2, fontSize: "1.01rem" }}>
                    <b>{k.replace(/house(\d+)/i, "House $1")}:</b> {houses[k]}
                  </div>
                ))}
              {houses.note && (
                <div
                  style={{
                    marginTop: 6,
                    color: "#F4D35E",
                    opacity: 0.7,
                    fontSize: ".98rem",
                  }}
                >
                  {houses.note}
                </div>
              )}
            </div>
          </div>
          <div
            style={{
              color: "#728ab7",
              fontSize: "0.93rem",
              opacity: 0.7,
              marginTop: 6,
            }}
          >
            Calculated with your current time. Visual natal wheel included.<br />
          </div>
        </div>
      )}
      {/* Entry help */}
      {!houses && !loading && !error && !inputTouched && (
        <div
          style={{
            color: "#728ab7",
            fontSize: "0.97rem",
            marginTop: 3,
            opacity: 0.85,
          }}
        >
          Enter latitude, longitude, and date. Current device time will be used.
        </div>
      )}
      {/* No results (if form submitted, but no data) */}
      {!houses && !loading && inputTouched && !error && (
        <div
          style={{
            color: "#728ab7",
            fontSize: "0.97rem",
            marginTop: 2,
            opacity: 0.85,
          }}
        >
          No data available for the given parameters.
        </div>
      )}
    </div>
  );
}

function inputStyle() {
  return {
    width: 150,
    borderRadius: 5,
    padding: "6px 8px",
    fontSize: "1.01rem",
    border: "1.2px solid #28529f",
    background: "#121b32",
    color: "#F4D35E",
    outline: "none",
    marginTop: 2,
  };
}

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
          width: 20,
          height: 20,
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

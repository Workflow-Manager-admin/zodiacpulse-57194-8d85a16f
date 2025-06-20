import React, { useState } from "react";
import axios from "axios";

// PUBLIC_INTERFACE
/**
 * HousesData - Manual entry Astrological Houses Finder.
 * User manually enters latitude, longitude, date, time, timezone, and house system (plus seconds).
 * The FreeAstrologyAPI western/houses endpoint is called with these details.
 * Handles loading, error, and result display.
 */
function HousesData() {
  // Manual input state
  const [inputs, setInputs] = useState({
    latitude: "",
    longitude: "",
    timezone: "",
    year: "",
    month: "",
    date: "",
    hours: "",
    minutes: "",
    seconds: "",
    house_system: "placidus"
  });
  const [inputTouched, setInputTouched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [houses, setHouses] = useState(null);

  // API KEYS and ENDPOINTS
  const ASTRO_API_KEY = "0d72cb2fa2ac14bee854efc0aade164f";
  const ASTRO_API_ENDPOINT = "https://json.freeastrologyapi.com/western/houses";

  // Helper: Input change handler
  function handleInputChange(e) {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value
    }));
    setInputTouched(true);
    setError("");
    setHouses(null);
  }

  // Validation helpers
  function validNumber(val, min, max) {
    if (typeof val !== "string" || val.trim() === "") return false;
    const num = Number(val);
    return !isNaN(num) && num >= min && num <= max;
  }
  function validDatePart(field, val) {
    if (field === "year") return validNumber(val, 1200, 2200);
    if (field === "month") return validNumber(val, 1, 12);
    if (field === "date") return validNumber(val, 1, 31);
    return false;
  }
  function validTimePart(field, val) {
    if (field === "hours") return validNumber(val, 0, 23);
    if (field === "minutes") return validNumber(val, 0, 59);
    if (field === "seconds") return validNumber(val, 0, 59);
    return false;
  }
  function allRequiredFieldsFilled() {
    const necessaryFields = [
      "latitude",
      "longitude",
      "timezone",
      "year",
      "month",
      "date",
      "hours",
      "minutes",
      "seconds",
      "house_system"
    ];
    return necessaryFields.every(
      (f) => typeof inputs[f] === "string" && inputs[f].trim() !== ""
    );
  }

  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setInputTouched(true);
    setError("");
    setHouses(null);

    // Validation
    if (!allRequiredFieldsFilled()) {
      setError("Please fill in all the required fields.");
      return;
    }
    if (
      !validNumber(inputs.latitude, -90, 90) ||
      !validNumber(inputs.longitude, -180, 180)
    ) {
      setError("Latitude must be between -90 and 90, and Longitude between -180 and 180.");
      return;
    }
    if (
      !validDatePart("year", inputs.year) ||
      !validDatePart("month", inputs.month) ||
      !validDatePart("date", inputs.date)
    ) {
      setError("Please enter a valid date (YYYY-MM-DD).");
      return;
    }
    if (
      !validTimePart("hours", inputs.hours) ||
      !validTimePart("minutes", inputs.minutes) ||
      !validTimePart("seconds", inputs.seconds)
    ) {
      setError("Please enter a valid time (HH:MM:SS).");
      return;
    }
    if (!inputs.timezone.match(/^[A-Za-z_\/]+$/)) {
      setError("Please enter a valid timezone string (e.g., 'Europe/London').");
      return;
    }

    setLoading(true);

    // Compose API payload
    const dateStr = `${inputs.year.padStart(4, "0")}-${inputs.month.padStart(2, "0")}-${inputs.date.padStart(2, "0")}`;
    const timeStr = `${inputs.hours.padStart(2, "0")}:${inputs.minutes.padStart(2, "0")}:${inputs.seconds.padStart(2, "0")}`;
    const payload = {
      date: dateStr,
      time: timeStr,
      latitude: Number(inputs.latitude),
      longitude: Number(inputs.longitude),
      timezone: inputs.timezone,
      house_system: inputs.house_system
    };

    try {
      const resp = await axios.post(
        ASTRO_API_ENDPOINT,
        payload,
        {
          headers: {
            Authorization: `Token ${ASTRO_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      if (resp && resp.data) {
        setHouses(resp.data);
        setError("");
      } else {
        setError("No data received from astrology API.");
      }
    } catch (err) {
      setError(
        "Failed to fetch astrological houses for this data. Please try again later."
      );
      setHouses(null);
    } finally {
      setLoading(false);
    }
  }

  // UI rendering: Form inputs helper
  function renderInputField({ label, name, placeholder, type = "text", min, max, helper }) {
    return (
      <div style={{ marginBottom: 9, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <label htmlFor={name} style={{ color: "#F4D35E", fontWeight: 500, fontSize: ".98rem" }}>
          {label}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          value={inputs[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          style={{
            width: 160,
            borderRadius: 5,
            padding: "6px 10px",
            fontSize: "1.01rem",
            border: "1.3px solid #28529f",
            background: "#121b32",
            color: "#F4D35E",
            outline: "none",
            marginTop: 1
          }}
          autoComplete="off"
          min={min}
          max={max}
          required
          aria-label={label}
        />
        {helper && (
          <div style={{ color: "#728ab7", fontSize: ".89rem", marginTop: 1, opacity: 0.9 }}>
            {helper}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="houses-manual-card"
      style={{
        background: "rgba(30,33,55,0.93)",
        borderRadius: "18px",
        boxShadow: "0 2px 17px #f4d35e11",
        maxWidth: 420,
        margin: "26px auto 0 auto",
        padding: "22px 15px 18px 15px",
        color: "#FFECC7",
        fontFamily: "inherit",
        minHeight: 160,
        textAlign: "center"
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: "1.15rem",
          marginBottom: 9,
          color: "#F4D35E",
          letterSpacing: "0.07em"
        }}
      >
        Astrological Houses Finder&nbsp;<span style={{ color: "#9cd6e6" }}>[Manual]</span>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 15,
          alignItems: "center"
        }}
        aria-label="Astrological Houses Manual Query Form"
      >
        <div style={{ display: "flex", gap: 18, marginBottom: 5, flexWrap: "wrap", justifyContent: "center" }}>
          {renderInputField({
            label: "Latitude",
            name: "latitude",
            placeholder: "e.g., 51.5072",
            helper: "Degrees (-90 &rarr; 90, North=+)",
            type: "number",
            min: -90,
            max: 90
          })}
          {renderInputField({
            label: "Longitude",
            name: "longitude",
            placeholder: "e.g., -0.1276",
            helper: "Degrees (-180 &rarr; 180, East=+)",
            type: "number",
            min: -180,
            max: 180
          })}
        </div>
        <div style={{ display: "flex", gap: 18, marginBottom: 4, flexWrap: "wrap", justifyContent: "center" }}>
          {renderInputField({
            label: "Timezone",
            name: "timezone",
            placeholder: "e.g., Europe/London",
            helper: "IANA string (e.g., America/New_York)"
          })}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <label htmlFor="house_system" style={{ color: "#F4D35E", fontWeight: 500, fontSize: ".98rem" }}>
              House System
            </label>
            <select
              id="house_system"
              name="house_system"
              value={inputs.house_system}
              onChange={handleInputChange}
              style={{
                borderRadius: 5,
                padding: "6px 10px",
                fontSize: "1.01rem",
                border: "1.3px solid #28529f",
                background: "#121b32",
                color: "#F4D35E",
                outline: "none",
                marginTop: 1,
                width: 140
              }}
              required
              aria-label="House System"
            >
              <option value="placidus">Placidus</option>
              <option value="koch">Koch</option>
              <option value="equal">Equal</option>
              <option value="whole">Whole</option>
              <option value="regiomontanus">Regiomontanus</option>
              <option value="campanus">Campanus</option>
            </select>
            <div style={{ color: "#728ab7", fontSize: ".89rem", marginTop: 1, opacity: 0.9 }}>
              Default is Placidus
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 3, flexWrap: "wrap", justifyContent: "center" }}>
          {renderInputField({
            label: "Year",
            name: "year",
            placeholder: "YYYY",
            helper: "1600–2100"
          })}
          {renderInputField({
            label: "Month",
            name: "month",
            placeholder: "MM",
            helper: "1–12"
          })}
          {renderInputField({
            label: "Date",
            name: "date",
            placeholder: "DD",
            helper: "1–31"
          })}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 2, flexWrap: "wrap", justifyContent: "center" }}>
          {renderInputField({
            label: "Hours",
            name: "hours",
            placeholder: "HH",
            helper: "0–23"
          })}
          {renderInputField({
            label: "Minutes",
            name: "minutes",
            placeholder: "MM",
            helper: "0–59"
          })}
          {renderInputField({
            label: "Seconds",
            name: "seconds",
            placeholder: "SS",
            helper: "0–59"
          })}
        </div>
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
            marginTop: 8,
            minWidth: 110
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
            <span style={{ color: "#9cd6e6", fontSize: "0.98rem" }}>
              Houses calculated for:<br />
              {inputs.latitude}, {inputs.longitude} | {inputs.timezone}
              <br />
              {`${inputs.year}-${inputs.month?.padStart?.(2, "0")}-${inputs.date?.padStart?.(2, "0")} ${inputs.hours?.padStart?.(2, "0")}:${inputs.minutes?.padStart?.(2, "0")}:${inputs.seconds?.padStart?.(2, "0")}`}
              <br />
              House System: {inputs.house_system.charAt(0).toUpperCase() + inputs.house_system.slice(1)}
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
                <div key={k} style={{ marginBottom: 3, fontSize: "1.04rem" }}>
                  <b>{k.replace(/(house)(\d+)/i, "House $2")}:</b> {houses[k]}
                </div>
              ))}
            {houses.note && (
              <div style={{
                marginTop: 6,
                color: "#F4D35E",
                opacity: 0.7,
                fontSize: ".99rem"
              }}>
                {houses.note}
              </div>
            )}
          </div>
          <div style={{
            color: "#728ab7", fontSize: "0.95rem",
            opacity: 0.62, marginTop: 7
          }}>
            Astrological houses are calculated for your exact entry.
          </div>
        </>
      )}
      {/* Helper text for initial state */}
      {!houses && !loading && !error && !inputTouched && (
        <div style={{
          color: "#728ab7",
          fontSize: "1.01rem",
          marginTop: 3,
          opacity: 0.87
        }}>
          <span>
            Enter latitude, longitude, date, time, timezone,<br />
            and house system to calculate your astrological houses.
          </span>
        </div>
      )}
      {/* No results */}
      {!houses && !loading && inputTouched && !error && (
        <div style={{
          color: "#728ab7",
          fontSize: "1.01rem",
          marginTop: 3,
          opacity: 0.87
        }}>
          {"No data available for the given parameters (check your input)."}
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
        margin: "0 5px 0 0"
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
          marginBottom: -4
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

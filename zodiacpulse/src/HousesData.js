import React, { useState } from "react";
import axios from "axios";

/**
 * HousesData - Minimal Astrological Houses Finder (plus Natal Wheel Chart).
 * User enters latitude, longitude, and date. All data is posted to the FreeAstrologyAPI endpoints.
 * Now also fetches and displays a natal wheel chart for the same inputs and current time.
 * Loading and error states for both house data and natal wheel visuals are handled.
 * The natal chart is shown alongside house data after both have returned.
 */
// PUBLIC_INTERFACE
function HousesData() {
  // Input state for coordinates and date
  const [inputs, setInputs] = useState({
    latitude: "",
    longitude: "",
    date: ""
  });
  const [inputTouched, setInputTouched] = useState(false);
  // State for fetching house data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [houses, setHouses] = useState(null);
  // State for fetching natal wheel chart image
  const [natalWheelLoading, setNatalWheelLoading] = useState(false);
  const [natalWheelError, setNatalWheelError] = useState("");
  const [natalWheelUrl, setNatalWheelUrl] = useState("");
  // API credentials/config
  const ASTRO_API_KEY = "0d72cb2fa2ac14bee854efc0aade164f";
  const ASTRO_API_ENDPOINT = "https://json.freeastrologyapi.com/western/houses";
  const ASTRO_WHEEL_ENDPOINT = "https://json.freeastrologyapi.com/western/wheel";

  // Handle user input changes (reset error/data state as needed)
  function handleInputChange(e) {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value
    }));
    setInputTouched(true);
    setError("");
    setHouses(null);
    setNatalWheelError("");
    setNatalWheelUrl("");
  }

  // PUBLIC_INTERFACE
  function validNumber(val, min, max) {
    if (typeof val !== "string" || val.trim() === "") return false;
    const num = Number(val);
    return !isNaN(num) && num >= min && num <= max;
  }
  // PUBLIC_INTERFACE
  function validDateString(d) {
    if (!d || typeof d !== "string") return false;
    const date = new Date(d);
    if (!(date instanceof Date) || isNaN(date)) return false;
    const year = date.getFullYear();
    if (year < 1600 || year > 2100) return false;
    return true;
  }
  // PUBLIC_INTERFACE
  function allRequiredFieldsFilled() {
    return ["latitude", "longitude", "date"].every(
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
    if (!validDateString(inputs.date)) {
      setError("Please select a valid date (YYYY-MM-DD) between 1600 and 2100.");
      return;
    }

    setLoading(true);
    setNatalWheelLoading(true); // Start loading both endpoints in parallel
    setNatalWheelError("");
    setNatalWheelUrl("");

    // Get device time for the moment of submission (as close to exact as possible)
    const now = new Date();
    const year = inputs.date.substring(0, 4);
    const month = inputs.date.substring(5, 7);
    const day = inputs.date.substring(8, 10);
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const timeStr = `${hours}:${minutes}:${seconds}`;

    // Determine timezone (IANA name, fallback to UTC)
    function getBrowserTimezone() {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      } catch {
        return "UTC";
      }
    }
    const timezone = getBrowserTimezone();

    // Compose body/payload for both endpoints (one extra param for wheel)
    const payload = {
      date: dateStr,
      time: timeStr,
      latitude: Number(inputs.latitude),
      longitude: Number(inputs.longitude),
      timezone: timezone,
      house_system: "placidus"
    };

    // Run house data and natal wheel requests in parallel for speed
    let houseError = "";
    let newHouses = null;
    let natalError = "";
    let natalUrl = "";

    const housePromise = axios.post(
      ASTRO_API_ENDPOINT,
      payload,
      {
        headers: {
          Authorization: `Token ${ASTRO_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    ).then((resp) => {
      if (resp && resp.data) {
        newHouses = resp.data;
        houseError = "";
      } else {
        houseError = "No data received from astrology API.";
      }
    }).catch(() => {
      houseError = "Failed to fetch astrological houses for these coordinates and date. Please try again later.";
    });

    const natalPromise = axios.post(
      ASTRO_WHEEL_ENDPOINT,
      { ...payload, chart_type: "natal" },
      {
        headers: {
          Authorization: `Token ${ASTRO_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    ).then((resp) => {
      if (resp && resp.data) {
        if (resp.data.url) {
          natalUrl = resp.data.url;
        } else if (resp.data.image) {
          natalUrl = "data:image/png;base64," + resp.data.image;
        } else {
          natalError = "No natal wheel chart image returned from astrology API.";
        }
      } else {
        natalError = "No natal wheel chart data received from astrology API.";
      }
    }).catch(() => {
      natalError = "Failed to fetch natal wheel chart. Please try again later.";
    });

    // Wait for both in parallel
    await Promise.all([housePromise, natalPromise]);
    setLoading(false);
    setNatalWheelLoading(false);

    if (houseError) {
      setError(houseError);
      setHouses(null);
    } else {
      setHouses(newHouses);
      setError("");
    }
    if (natalError) {
      setNatalWheelError(natalError);
      setNatalWheelUrl("");
    } else {
      setNatalWheelError("");
      setNatalWheelUrl(natalUrl);
    }
  }

  // UI rendering: Form inputs helper
  function renderInputField({
    label,
    name,
    placeholder,
    type = "text",
    min,
    max,
    helper
  }) {
    return (
      <div
        style={{
          marginBottom: 9,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "100%"
        }}
      >
        <label
          htmlFor={name}
          style={{
            color: "#F4D35E",
            fontWeight: 500,
            fontSize: ".98rem"
          }}
        >
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
          <div
            style={{
              color: "#728ab7",
              fontSize: ".89rem",
              marginTop: 1,
              opacity: 0.9
            }}
          >
            {helper}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="houses-minimal-card"
      style={{
        background: "rgba(30,33,55,0.93)",
        borderRadius: "18px",
        boxShadow: "0 2px 17px #f4d35e11",
        maxWidth: 400,
        margin: "34px auto 0 auto",
        padding: "22px 15px 18px 15px",
        color: "#FFECC7",
        fontFamily: "inherit",
        minHeight: 140,
        textAlign: "center"
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: "1.14rem",
          marginBottom: 10,
          color: "#F4D35E",
          letterSpacing: "0.06em"
        }}
      >
        Astrological Houses Finder&nbsp;
        <span style={{ color: "#9cd6e6" }}>[Minimal]</span>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 14,
          alignItems: "center",
          width: "100%"
        }}
        aria-label="Astrological Houses Query Form"
      >
        <div
          style={{
            display: "flex",
            gap: 20,
            marginBottom: 5,
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%"
          }}
        >
          {renderInputField({
            label: "Latitude",
            name: "latitude",
            placeholder: "e.g., 51.5072",
            helper: "Degrees (-90 → 90, North=+)",
            type: "number",
            min: -90,
            max: 90
          })}
          {renderInputField({
            label: "Longitude",
            name: "longitude",
            placeholder: "e.g., -0.1276",
            helper: "Degrees (-180 → 180, East=+)",
            type: "number",
            min: -180,
            max: 180
          })}
        </div>
        <div
          style={{
            marginBottom: 9,
            width: "100%"
          }}
        >
          <label
            htmlFor="date"
            style={{
              color: "#F4D35E",
              fontWeight: 500,
              fontSize: ".98rem"
            }}
          >
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={inputs.date}
            onChange={handleInputChange}
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
            required
            aria-label="Date"
            min="1600-01-01"
            max="2100-12-31"
          />
          <div style={{ color: "#728ab7", fontSize: ".89rem", marginTop: 1, opacity: 0.9 }}>
            Choose a calendar date (1600–2100)
          </div>
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
        <div
          style={{
            color: "#E85E45",
            background: "#20111133",
            borderRadius: 7,
            fontWeight: 500,
            padding: "8px 5px 7px 5px",
            marginTop: 6,
            marginBottom: 2,
            fontSize: "1.03rem"
          }}
        >
          <span style={{ fontWeight: 600 }}>Error:</span> {error}
        </div>
      )}
      {loading && (
        <div style={{ color: "#F4D35E", padding: "11px 0", fontWeight: 500 }}>
          <Spinner />&nbsp;Loading data...
        </div>
      )}
      {/* Success: Show house data */}
      {houses && !loading && (
        <>
          <div
            style={{
              borderBottom: "1px solid #28529f77",
              paddingBottom: 6,
              marginBottom: 8,
              marginTop: 3
            }}
          >
            <span style={{ color: "#9cd6e6", fontSize: "0.98rem" }}>
              Houses calculated for:<br />
              {inputs.latitude}, {inputs.longitude} | {inputs.date}
              <br />
              (Current local time used:{" "}
              {(() => {
                const now = new Date();
                return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
              })()}
              , {Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"})
            </span>
          </div>
          {/* Natal Wheel Chart (Side by side or stacked) */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "13px",
            marginTop: "7px"
          }}>
            <div style={{
              display: "flex",
              flexDirection: "row",
              gap: "18px",
              alignItems: "flex-start",
              justifyContent: "center",
              width: "100%"
            }}>
              {/* Chart */}
              <div style={{
                minWidth: 138,
                minHeight: 138,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start"
              }}>
                {natalWheelLoading && (
                  <div style={{ color: "#F4D35E", padding: "9px 0" }}>
                    <Spinner /> Loading natal wheel...
                  </div>
                )}
                {natalWheelError && (
                  <div style={{
                    color: "#E85E45",
                    background: "#28182633",
                    borderRadius: 7,
                    fontWeight: 500,
                    padding: "7px 6px 7px 6px",
                    marginBottom: 2,
                    fontSize: "0.99rem"
                  }}>
                    <span style={{ fontWeight: 600 }}>Chart Error:</span> {natalWheelError}
                  </div>
                )}
                {natalWheelUrl && (
                  <img
                    src={natalWheelUrl}
                    alt="Natal Chart Wheel"
                    style={{
                      borderRadius: "12px",
                      border: "2.2px solid #28529f",
                      boxShadow: "0 2px 15px #28529f55",
                      maxWidth: 160,
                      maxHeight: 160,
                      width: "auto",
                      height: "auto",
                      background: "#181e32"
                    }}
                  />
                )}
              </div>
              {/* Houses Data */}
              <div>
                {Object.keys(houses)
                  .filter((k) => k.toLowerCase().startsWith("house"))
                  .sort((a, b) => {
                    // e.g., 'house1', 'house2'... sort numerically
                    const nA = parseInt(a.replace(/[^0-9]/g, "")) || 0;
                    const nB = parseInt(b.replace(/[^0-9]/g, "")) || 0;
                    return nA - nB;
                  })
                  .map((k) => (
                    <div key={k} style={{ marginBottom: 3, fontSize: "1.04rem" }}>
                      <b>{k.replace(/(house)(\d+)/i, "House $2")}:</b> {houses[k]}
                    </div>
                  ))}
                {houses.note && (
                  <div
                    style={{
                      marginTop: 6,
                      color: "#F4D35E",
                      opacity: 0.7,
                      fontSize: ".99rem"
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
                fontSize: "0.95rem",
                opacity: 0.62,
                marginTop: 7
              }}
            >
              Astrological houses are calculated for your exact entry (using your current time).<br />
              Natal wheel shown as visual chart (for birth time and location).
            </div>
          </div>
        </>
      )}
      {/* Helper text for initial state */}
      {!houses && !loading && !error && !inputTouched && (
        <div
          style={{
            color: "#728ab7",
            fontSize: "1.01rem",
            marginTop: 3,
            opacity: 0.87
          }}
        >
          <span>
            Enter latitude, longitude, and your date. The current time will be used automatically.
          </span>
        </div>
      )}
      {/* No results */}
      {!houses && !loading && inputTouched && !error && (
        <div
          style={{
            color: "#728ab7",
            fontSize: "1.01rem",
            marginTop: 3,
            opacity: 0.87
          }}
        >
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

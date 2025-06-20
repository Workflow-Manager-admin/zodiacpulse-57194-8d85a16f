import React, { useState, useEffect } from "react";

// PUBLIC_INTERFACE
/**
 * HousesData - Geo Auto-detect + Timezone + Astrological Houses display.
 * Fully automatic UX:
 *   1. Detects location via browser geolocation.
 *   2. Looks up timezone from geo-details API.
 *   3. Fetches house data from /api/houses.
 * Provides UI feedback through all stages.
 */
function HousesData() {
  // State for location, timezone, and house data
  const [location, setLocation] = useState(null); // { latitude, longitude }
  const [timezone, setTimezone] = useState(null);
  const [houses, setHouses] = useState(null);

  // Staged status: "init", "locating", "tz-fetch", "houses-fetch", "success", "error"
  const [stage, setStage] = useState("init");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState("unknown");

  // On first mount, request geolocation
  useEffect(() => {
    setStage("locating");
    setMessage("Detecting your location…");
    setError(null);
    setLocation(null);
    setTimezone(null);
    setHouses(null);
    setPermission("unknown");

    // Check geolocation permission in modern browsers
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((status) => {
          setPermission(status.state); // "granted", "prompt", "denied"
          if (status.state === "denied") {
            setStage("error");
            setError(
              "Location permission denied. Enable location to auto-calculate houses, or check your browser settings."
            );
          }
          status.onchange = () => setPermission(status.state);
        })
        .catch(() => setPermission("unknown"));
    }

    // PUBLIC_INTERFACE: navigator.geolocation flow
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setStage("tz-fetch");
          setMessage("Detected location. Looking up timezone…");
        },
        (err) => {
          setStage("error");
          setPermission("denied");
          setError(
            err.code === 1
              ? "Location access denied. Please allow location sharing for full functionality."
              : "Failed to retrieve your location. Is your device location enabled?"
          );
        },
        { enableHighAccuracy: false, timeout: 9000 }
      );
    } else {
      setStage("error");
      setError("Geolocation is not supported in this browser.");
    }
    // Only once on mount
    // eslint-disable-next-line
  }, []);

  // After getting location, get timezone info from geo-details API
  useEffect(() => {
    if (!location || stage !== "tz-fetch") return;

    setMessage("Fetching timezone for your coordinates…");
    setTimezone(null);
    setError(null);

    // Use geo-details API: /api/geo-details?lat=...&lon=...
    const geoUrl = `/api/geo-details?lat=${location.latitude}&lon=${location.longitude}`;
    fetch(geoUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Could not retrieve geo-details from API.");
        return res.json();
      })
      .then((data) => {
        if (!data.timezone) throw new Error("Timezone not found for your location.");
        setTimezone(data.timezone);
        setStage("houses-fetch");
        setMessage("Timezone found. Getting astrological houses…");
      })
      .catch((e) => {
        setStage("error");
        setError(
          e?.message ||
            "Failed to retrieve your timezone data from the geo-details API."
        );
      });
  }, [location, stage]);

  // After getting timezone, fetch house data
  useEffect(() => {
    if (!location || !timezone || stage !== "houses-fetch") return;

    setMessage("Calculating astrological houses...");
    setHouses(null);
    setError(null);

    // Compose ISO timestamp (current time, user time-zone ideally, but use UTC for now)
    const currentDateTime = new Date().toISOString();
    // /api/houses?lat=...&lon=...&tz=...&datetime=...
    const housesUrl = `/api/houses?lat=${location.latitude}&lon=${location.longitude}` +
      `&tz=${encodeURIComponent(timezone)}&datetime=${encodeURIComponent(currentDateTime)}`;

    fetch(housesUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch house data.");
        return res.json();
      })
      .then((data) => {
        setHouses(data);
        setStage("success");
      })
      .catch((e) => {
        setStage("error");
        setError(
          e?.message ||
            "Astrological houses API error. Try refreshing or check your connection."
        );
      });
  }, [location, timezone, stage]);

  // UI: Determine main content to show
  let feedback;
  if (stage === "locating") {
    feedback = (
      <div style={feedbackStyle}>
        <Spinner />
        <div>Detecting your location…</div>
        {permission === "prompt" && (
          <div style={smallHint}>
            Please allow location access if prompted.
          </div>
        )}
      </div>
    );
  } else if (stage === "tz-fetch") {
    feedback = (
      <div style={feedbackStyle}>
        <Spinner />
        <div>
          <span style={{ color: "#F4D35E" }}>
            Location: lat {location?.latitude?.toFixed(4)}, lon {location?.longitude?.toFixed(4)}
          </span>
        </div>
        <div>Determining timezone…</div>
      </div>
    );
  } else if (stage === "houses-fetch") {
    feedback = (
      <div style={feedbackStyle}>
        <Spinner />
        <div>
          Timezone: <span style={{ color: "#F4D35E" }}>{timezone}</span>
        </div>
        <div>Calculating houses…</div>
      </div>
    );
  } else if (stage === "error") {
    feedback = (
      <div style={{ ...feedbackStyle, color: "#E85E45", background: "#20111133", borderRadius: 7 }}>
        <span style={{ fontWeight: 600 }}>Error:</span>
        <span>{error || "Something went wrong."}</span>
        {(permission === "denied" || error?.toLowerCase().includes("denied")) && (
          <div style={smallHint}>
            Enable location access in your browser and refresh to try again.
          </div>
        )}
        <button
          style={{ ...btnStyle, marginTop: 13, background: "#F4D35E", color: "#18243f", padding: "6px 18px" }}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  } else if (stage === "success" && houses) {
    feedback = (
      <div style={{ marginTop: 9, color: "#FAEDCD", fontSize: "1.11rem" }}>
        <div style={{
          borderBottom: "1px solid #28529f77", paddingBottom: 6, marginBottom: 8
        }}>
          Location: <b style={{ color: "#F4D35E" }}>
            lat {location.latitude.toFixed(4)}, lon {location.longitude.toFixed(4)}</b>
          <br />
          Timezone: <b style={{ color: "#F4D35E" }}>{timezone}</b>
        </div>
        <div>
          {Object.keys(houses)
            .filter((k) => k.toLowerCase().startsWith("house"))
            .map((k) => (
              <div key={k}>
                <b>{k.replace(/(house)(\d+)/i, "House $2")}:</b> {houses[k]}
              </div>
            ))}
        </div>
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
        <div style={smallHint}>Astrological houses reflect your personal celestial blueprint based on this place and moment.</div>
      </div>
    );
  } else {
    // "init" or fallback
    feedback = (
      <div style={{ ...feedbackStyle, color: "#728ab7", fontSize: "1.01rem" }}>
        Auto-detecting your location and astrological houses…
      </div>
    );
  }

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
        Astrological Houses (Auto Location)
      </div>
      {feedback}
    </div>
  );
}

// Small accent spinner component
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

const feedbackStyle = {
  color: "#F4D35E",
  background: "#20293a22",
  borderRadius: 7,
  padding: "13px 7px",
  fontWeight: 500,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontSize: "1.08rem",
  gap: 6,
};

const btnStyle = {
  background: "#F4D35E",
  color: "#18243f",
  border: "none",
  borderRadius: 4,
  fontWeight: 600,
  padding: "7px 13px",
  cursor: "pointer",
  fontSize: "1.07rem",
};

const smallHint = {
  color: "#728ab7",
  fontSize: "0.95rem",
  opacity: 0.62,
  marginTop: 6,
};

export default HousesData;


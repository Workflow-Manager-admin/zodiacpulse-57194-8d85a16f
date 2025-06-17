import React from "react";
import "./App.css";
import ZodiacPulseMain from "./ZodiacPulseMain";

// PUBLIC_INTERFACE
function App() {
  // ZodiacPulse app main wrapper.
  return (
    <div className="app" style={{ background: "transparent" }}>
      <ZodiacPulseMain />
    </div>
  );
}

export default App;
import React from "react";
import AIJournalingTool from "./journaling_app";
import ApiTest from "./ApiTest";

function App() {
  // Simple routing - check URL path
  const path = window.location.pathname;

  // Test page for debugging API
  if (path === "/ApiTest.tsx") {
    return <ApiTest />;
  }

  // Main app
  return <AIJournalingTool />;
}

export default App;
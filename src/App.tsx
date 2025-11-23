import React, { useEffect, useState } from "react";
import AIJournalingTool from "./journaling_app";
import ApiTest from "./ApiTest";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Listen for URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Test page
  if (currentPath === "/api-test") {
    return <ApiTest />;
  }

  // Main app
  return <AIJournalingTool />;
}

export default App;
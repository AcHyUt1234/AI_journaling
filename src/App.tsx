import React, { useEffect, useState } from "react";
import AIJournalingTool from "./journaling_app";

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

  // Main app
  return <AIJournalingTool/>;
}

export default App;

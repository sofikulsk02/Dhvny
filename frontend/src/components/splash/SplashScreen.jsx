// src/components/splash/SplashScreen.jsx
import React, { useEffect, useState } from "react";
import splashImage from "../../assets/images/marcelo-vaz-ka6WGHXcFMY-unsplash.jpg";

export default function SplashScreen({ onComplete }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Auto-complete after 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
      setTimeout(() => {
        onComplete();
      }, 500); // Short delay for fade out
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      {showSplash && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-500 opacity-100"
          style={{
            backgroundImage: `url(${splashImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Dark overlay for better readability */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      )}
    </>
  );
}

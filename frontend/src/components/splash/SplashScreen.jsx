// src/components/splash/SplashScreen.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onComplete }) {
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    // Auto-complete after 2 seconds
    const timer = setTimeout(() => {
      setVideoEnded(true);
      setTimeout(() => {
        onComplete();
      }, 800); // Wait for fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!videoEnded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 animate-gradient-shift"></div>

          {/* Blurred overlay for smooth edges */}
          <div className="absolute inset-0 backdrop-blur-sm"></div>

          {/* Video container with blend modes */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-full h-full flex items-center justify-center"
          >
            <div className="relative w-full h-full max-w-7xl max-h-screen flex items-center justify-center">
              {/* Video with blend mode and soft edges */}
              <video
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain"
                style={{
                  mixBlendMode: "screen",
                  filter: "brightness(1.2) contrast(1.1)",
                  maskImage:
                    "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
                }}
                onEnded={() => {
                  setVideoEnded(true);
                  setTimeout(() => {
                    onComplete();
                  }, 800);
                }}
              >
                <source
                  src="https://res.cloudinary.com/desr9wxwa/video/upload/v1761907016/5180-183786417_vxwbyg.mp4"
                  type="video/mp4"
                />
              </video>

              {/* Radial gradient overlay for soft edges */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, rgba(102, 126, 234, 0.3) 70%, rgba(102, 126, 234, 0.8) 100%)",
                }}
              ></div>
            </div>
          </motion.div>

          {/* App name with animation */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute bottom-20 z-20"
          >
            <h1 className="text-6xl font-bold text-white tracking-wider drop-shadow-2xl">
              Dhvny
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="h-1 bg-white/80 mt-2 rounded-full"
            ></motion.div>
          </motion.div>

          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

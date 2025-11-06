import React, { useState, useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { SocketProvider } from "./contexts/SocketContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { JamProvider } from "./contexts/JamContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import MobileShell from "./components/layout/MobileShell";
import SplashScreen from "./components/splash/SplashScreen";
import Footer from "./pages/Footer";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Check if splash has been shown in this session
  useEffect(() => {
    const splashShown = sessionStorage.getItem("dhvny_splash_shown");
    if (splashShown) {
      setShowSplash(false);
      setIsReady(true);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("dhvny_splash_shown", "true");
    setShowSplash(false);
    setTimeout(() => {
      setIsReady(true);
    }, 100);
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <SocketProvider>
          <NotificationProvider>
            <JamProvider>
              <PlayerProvider>
                {showSplash && (
                  <SplashScreen onComplete={handleSplashComplete} />
                )}
                {isReady && (
                  <MobileShell>
                    <AppRoutes />
                    <Footer></Footer>
                  </MobileShell>
                )}
              </PlayerProvider>
            </JamProvider>
          </NotificationProvider>
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

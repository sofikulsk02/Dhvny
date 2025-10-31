// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState("light");
  const [accentColor, setAccentColor] = useState("purple");

  // Load theme from user settings or localStorage
  useEffect(() => {
    if (user?.settings?.appearance) {
      const savedTheme = user.settings.appearance.theme || "light";
      const savedAccent = user.settings.appearance.accentColor || "purple";
      setTheme(savedTheme);
      setAccentColor(savedAccent);
      applyTheme(savedTheme);
      applyAccentColor(savedAccent);
    } else {
      // Load from localStorage if not logged in
      const localTheme = localStorage.getItem("theme") || "light";
      const localAccent = localStorage.getItem("accentColor") || "purple";
      setTheme(localTheme);
      setAccentColor(localAccent);
      applyTheme(localTheme);
      applyAccentColor(localAccent);
    }
  }, [user]);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;

    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Save to localStorage
    localStorage.setItem("theme", newTheme);
  };

  const applyAccentColor = (color) => {
    const root = document.documentElement;

    // Define color mappings
    const colorMap = {
      purple: { primary: "#9333ea", hover: "#7e22ce", light: "#f3e8ff" },
      blue: { primary: "#2563eb", hover: "#1d4ed8", light: "#dbeafe" },
      pink: { primary: "#ec4899", hover: "#db2777", light: "#fce7f3" },
      green: { primary: "#059669", hover: "#047857", light: "#d1fae5" },
      orange: { primary: "#ea580c", hover: "#c2410c", light: "#ffedd5" },
      red: { primary: "#dc2626", hover: "#b91c1c", light: "#fee2e2" },
      yellow: { primary: "#ca8a04", hover: "#a16207", light: "#fef9c3" },
      indigo: { primary: "#4f46e5", hover: "#4338ca", light: "#e0e7ff" },
    };

    const colors = colorMap[color] || colorMap.purple;

    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-primary-hover", colors.hover);
    root.style.setProperty("--color-primary-light", colors.light);

    // Save to localStorage
    localStorage.setItem("accentColor", color);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const changeAccentColor = (color) => {
    setAccentColor(color);
    applyAccentColor(color);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accentColor,
        changeTheme,
        changeAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

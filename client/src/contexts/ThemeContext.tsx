import React, { createContext, useContext, useState, useEffect } from "react";

export type AccentMode = "sage" | "pink";

interface ThemeContextType {
  accent: AccentMode;
  setAccent: (accent: AccentMode) => void;
  toggleAccent: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accent, setAccentState] = useState<AccentMode>(() => {
    try {
      const saved = localStorage.getItem("testbook_accent_mode");
      return saved === "pink" ? "pink" : "sage";
    } catch {
      return "sage";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("testbook_accent_mode", accent);
    } catch {
      // storage unavailable fallback
    }
    document.documentElement.setAttribute("data-accent", accent);
    document.body.setAttribute("data-accent", accent);
  }, [accent]);

  const setAccent = (newAccent: AccentMode) => {
    setAccentState(newAccent);
  };

  const toggleAccent = () => {
    setAccentState((prev) => (prev === "sage" ? "pink" : "sage"));
  };

  return (
    <ThemeContext.Provider value={{ accent, setAccent, toggleAccent }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

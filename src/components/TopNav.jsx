import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Sun, Moon } from "lucide-react";
import "./TopNav.css";

export const TopNav = () => {
  const { i18n } = useTranslation();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
    }
  }, [isDark]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="top-nav-container">
      <div className="logo-brand">
        <img
          src="/icon_kiro.png"
          alt="Kiro"
          style={{ width: "48px", height: "48px", objectFit: "contain" }}
        />
      </div>
      <div className="top-nav">
        {/* Theme Switcher */}
        <div className="nav-group">
          <button
            className="nav-icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="nav-divider"></div>

        {/* Language Switcher */}
        <div className="nav-group">
          <Globe size={18} className="nav-icon" />
          <button
            className={`lang-btn ${i18n.language === "fr" ? "active" : ""}`}
            onClick={() => changeLanguage("fr")}
          >
            FR
          </button>
          <button
            className={`lang-btn ${i18n.language === "en" ? "active" : ""}`}
            onClick={() => changeLanguage("en")}
          >
            EN
          </button>
          <button
            className={`lang-btn ${i18n.language === "ht" ? "active" : ""}`}
            onClick={() => changeLanguage("ht")}
          >
            HT
          </button>
        </div>
      </div>
    </div>
  );
};

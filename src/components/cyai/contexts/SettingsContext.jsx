/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: SettingsContext.jsx
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const defaultSettings = {
  fontSize: 'M', // S, M, L
  messageDensity: 'comfy', // compact, comfy
  uiFont: 'Inter',
  codeFont: 'JetBrains Mono',
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('cyber-safety-settings');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('cyber-safety-settings', JSON.stringify(settings));
    
    // Apply font settings to document
    document.documentElement.style.setProperty('--font-ui', settings.uiFont);
    document.documentElement.style.setProperty('--font-code', settings.codeFont);
    
    // Apply font size class
    document.documentElement.className = document.documentElement.className
      .replace(/font-size-[SML]/g, '')
      + ` font-size-${settings.fontSize}`;
    
    // Apply message density class
    document.documentElement.className = document.documentElement.className
      .replace(/density-(compact|comfy)/g, '')
      + ` density-${settings.messageDensity}`;
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};


/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: LayoutContext.jsx
 */

import { createContext, useContext, useState } from 'react';

const LayoutContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

export const LayoutProvider = ({ children }) => {
    const [showTopBar, setShowTopBar] = useState(true);
    const [showGreeting, setShowGreeting] = useState(true);
    const [topBarContent, setTopBarContent] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);
    
    return (
        <LayoutContext.Provider value={{
          showTopBar, setShowTopBar,
          showGreeting, setShowGreeting,
          topBarContent, setTopBarContent,
          showSidebar, setShowSidebar
       }}>
        {children}
        </LayoutContext.Provider>
    );
};
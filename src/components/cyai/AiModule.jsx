/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: AiModule.jsx
 */

import React, { useEffect, useState } from "react";
import { ChatProvider } from "./contexts/ChatContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import { useLayout } from "@/contexts/LayoutContext";
import { useTheme } from "@/contexts/ThemeContext";

function CyrenAI() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setShowSidebar, setShowTopBar } = useLayout();
  const { setTheme } = useTheme();

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    setShowSidebar(false);
    setShowTopBar(false);
    setTheme("light");
    return () => {
      setShowSidebar(true);
      setShowTopBar(true);
      setTheme(currentTheme || "light");
    };
  }, [setShowSidebar, setShowTopBar, setTheme]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <SettingsProvider>
      <ChatProvider>
        <div className="relative h-screen overflow-hidden">
          {/* BACKGROUND LAYER */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <picture className="absolute inset-0 h-full w-full overflow-hidden"
           >

              <img
                src="data:image/webp;base64,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"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-50 blur-2xl"
              />
            </picture>
            <div className="absolute inset-0 h-full w-full bg-gradient-to-b from-transparent to-white" />
          </div>

          {/* FOREGROUND */}
          <div className="relative flex h-full w-full flex-1 transition-colors z-0">
            <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
            <ChatInterface isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
          </div>
        </div>
      </ChatProvider>
    </SettingsProvider>
  );
}

export default CyrenAI;

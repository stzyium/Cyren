/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: TopBar.jsx
 */

/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge.jsx'
import {
  Bell,
  User,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Zap,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../../contexts/ThemeContext';
import { useLayout } from '@/contexts/LayoutContext';

const TopBar = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState(1); // Mock notification count
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const { showGreeting, setShowGreeting, topBarContent, setTopBarContent } = useLayout();

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'cyberpunk':
        return <Zap className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'cyberpunk':
        return 'Cyberpunk';
      default:
        return 'Light';
    }
  };
  return (
    <div className="h-16 bg-background border-b border-border glass flex items-center shadow-sm justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="xl"
          className="cursor-pointer lg:hidden hover-lift"
          onClick={onMobileMenuToggle}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
        {showGreeting && (
          <h2 className="text-lg font-semibold text-foreground hidden sm:flex items-center gap-2">
            {(() => {
              const hour = new Date().getHours();
              if (hour < 12) return "Good morning";
              if (hour < 18) return "Good afternoon";
              return "Good evening";
            })()}, Python
            <Badge variant={isOnline ? "secondary" : "destructive"} className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4" /> 
              ) : (
                <WifiOff className="w-4 h-4" />
              )} {isOnline ? "Connected" : "No Internet"}
            </Badge>
          </h2>
      )}
      </div>
      {topBarContent && (
          <div className="flex items-center space-x-2 lg:space-x-4">
            {topBarContent}
          </div>
      )}
      <div className="flex items-center space-x-1/2 lg:space-x-4">
        {/* Theme Switcher */}
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer flex items-center space-x-2 hover-lift"
          onClick={toggleTheme}
        >
          {getThemeIcon()}
          <span className="hidden md:inline text-sm">{getThemeLabel()}</span>
        </Button>

        {/* Notifications
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer relative hover-lift"
          >
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <motion.div
                className="cursor-pointer absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-medium pulse-glow"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {notifications}
              </motion.div>
            )}
          </Button>
        </div> */}

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer flex items-center space-x-2 hover-lift"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center glow">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
          </Button>

          {/* User Dropdown Menu */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg glass z-[9999]"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-popover-foreground">
                      currently
                    </p>
                    <p className="text-xs text-muted-foreground">
                      doesnt work
                    </p>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer w-full justify-start text-sm"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default TopBar;


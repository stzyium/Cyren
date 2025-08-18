/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: Sidebar.jsx
 */

/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Lock,
  Zap,
  Ghost,
  Gamepad2,
  UserX,
  Eye,
  Link,
  Newspaper,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useLocation, useNavigate} from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/password-checker', label: 'Password Utilities', icon: Lock },
    { path: '/fake-profile', label: 'Fake Profile Analyzer', icon: UserX },
    { path: '/url-scanner', label: 'Site Scanner', icon: Link },
    { path: '/vault', label: 'Password Vault', icon: Shield },
    { path: '/hacker-simulator', label: 'Hacker Simulator', icon: Zap },
    { path: '/ghost-mode', label: 'Ghost Mode', icon: Ghost },
    { path: '/scam-buster', label: 'Scam Buster Game', icon: Gamepad2 },
    { path: '/cybercrimes-tracker', label: 'Cybercrime Tracker', icon: Eye },
    { path: '/news-feed', label: 'Cyber News', icon: Newspaper },
  ];

  const sidebarVariants = {
    expanded: {
      width: 280,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    collapsed: {
      width: 80,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const labelVariants = {
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2, delay: 0.1, ease: 'easeOut' }
    },
    hidden: {
      opacity: 0,
      x: -10,
      transition: { duration: 0.15, ease: 'easeIn' }
    }
  };

  const logoTextVariants = {
    visible: {
      opacity: 1,
      transition: { duration: 0.2, delay: 0.1 }
    },
    hidden: {
      opacity: 0,
      transition: { duration: 0.15 }
    }
  };

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  return (
    <motion.div
      className="h-screen bg-sidebar border-r border-sidebar-border shadow-md glass relative overflow-hidden"
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      initial={false}
    >
      {/* Logo Section */}
      <div
        onClick={() => handleNavigate('/cyren')}
        className="cursor-pointer p-5 border-b border-sidebar-border"
      >
        <div className="flex items-center space-x-2">
          <div className={`${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'} rounded-xl flex items-center justify-center glow flex-shrink-0`}>
            <img src="/160423230.png" alt="Logo" className={`${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'}`} />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="logo-text"
                variants={logoTextVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="overflow-hidden"
              >
                <h1 className="text-xl font-bold text-sidebar-foreground whitespace-nowrap">
                  Cyren
                </h1>
                <p className="text-sm text-sidebar-foreground/60 whitespace-nowrap">
                  Tap to chat with AI
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                className={`cursor-pointer
                  w-full h-12 transition-all duration-200 ease-out
                  ${isCollapsed ? 'justify-center px-3' : 'justify-start px-4'} 
                  ${isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 glow shadow-md' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm'
                  }
                  hover:scale-105 active:scale-95 relative overflow-hidden
                `}
                onClick={() => handleNavigate(item.path)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      key={`label-${item.path}`}
                      className="ml-3 text-left overflow-hidden whitespace-nowrap"
                      variants={labelVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 ease-out hover:scale-105 active:scale-95"
          onClick={handleToggleCollapse}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar;

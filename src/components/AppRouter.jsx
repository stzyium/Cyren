/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: AppRouter.jsx
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './dashboard/Dashboard';
import PasswordChecker from './modules/PasswordUtilities';
import HackerSimulator from './modules/HackerSimulator';
import FakeProfileAnalyzer from './modules/FakeProfileAnalyzer';
import NewsFeed from './modules/NewsFeed';
import CybercrimesTracker from './modules/CybreCrimeTracker';
import GhostMode from './modules/GhostMode';
import ScamBusterGame from './modules/ScamBusterGame';
import URLScanner from './modules/LinkScanner';
import CyrenAI from './cyai/AiModule';
import PasswordVault from './modules/Vault';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/cyren/:chat_Id?" element={<CyrenAI />} />
      <Route path="/password-checker" element={<PasswordChecker />} />
      <Route path="/hacker-simulator" element={<HackerSimulator />} />
      <Route path="/ghost-mode" element={<GhostMode />} />
      <Route path="/scam-buster" element={<ScamBusterGame />} />
      <Route path="/fake-profile" element={<FakeProfileAnalyzer />} />
      <Route path="/cybercrimes-tracker" element={<CybercrimesTracker />} />
      <Route path="/news-feed" element={<NewsFeed />} />
      <Route path="/url-scanner" element={<URLScanner />} />
      <Route path="/analytics" element={<Dashboard />} />
      <Route path="*" element={<Dashboard />} />
      <Route path="/vault" element={<PasswordVault />} />
    </Routes>
  );
};

export default AppRouter;

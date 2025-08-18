/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: App.jsx
 */

import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LayoutProvider } from './contexts/LayoutContext';
import AppRouter from './components/AppRouter';
import Layout from './components/layout/Layout';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <h1>Loading, please wait...</h1>
      </div>
    );
  }
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <LayoutProvider>
          <Layout>
            <AppRouter />
          </Layout>
        </LayoutProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;

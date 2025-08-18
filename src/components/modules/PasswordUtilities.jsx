/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: PasswordUtilities.jsx
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, Shield, 
  RefreshCw, Copy, Dices, Settings, History, Database, 
  Key, Timer, Zap, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const PasswordChecker = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('analyzer');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatorSettings, setGeneratorSettings] = useState({
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false
  });
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [breachResult, setBreachResult] = useState(null);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const similar = 'il1Lo0O';
    
    let charset = '';
    if (generatorSettings.includeUppercase) charset += uppercase;
    if (generatorSettings.includeLowercase) charset += lowercase;
    if (generatorSettings.includeNumbers) charset += numbers;
    if (generatorSettings.includeSymbols) charset += symbols;
    
    if (generatorSettings.excludeSimilar) {
      charset = charset.split('').filter(char => !similar.includes(char)).join('');
    }
    
    let password = '';
    for (let i = 0; i < generatorSettings.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setGeneratedPassword(password);
    
    // Add to history
    const newEntry = {
      password,
      timestamp: new Date().toLocaleString(),
      strength: getPasswordStrength(password)
    };
    setPasswordHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10
  };

  const getPasswordStrength = (pwd) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /\d/.test(pwd),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      common: !['password', '123456', 'qwerty', 'admin'].includes(pwd.toLowerCase())
    };
    const score = Object.values(checks).filter(Boolean).length;
    return score <= 2 ? 'Weak' : score <= 4 ? 'Medium' : 'Strong';
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const checkForBreaches = async () => {
    if (!password) return;
    
    setIsCheckingBreach(true);

    try {
      const response = await fetch('/api/db/passwd/' + password, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 400) {
          setBreachResult({error: data.error})
          return;
        }
        throw new Error(`Unexpected error ${response.status}`)
      }
      const isBreached = data.breach_count > 0;
      setBreachResult({
        isBreached,
        breaches: data.breach_count,
        checkedAt: new Date().toLocaleString()
      });
      setIsCheckingBreach(false);
    } catch (error) {
      setBreachResult({error: "Unexpected error"});
      console.log(error)
    } finally {
      setIsCheckingBreach(false);
    }
  };

  const estimateCrackTime = (pwd) => {
    const charset = getCharsetSize(pwd);
    const combinations = Math.pow(charset, pwd.length);
    const secondsToTarget = combinations / 1000000000; // Assuming 1B guesses/second
    
    if (secondsToTarget < 60) return 'Less than a minute';
    if (secondsToTarget < 3600) return `${Math.floor(secondsToTarget / 60)} minutes`;
    if (secondsToTarget < 86400) return `${Math.floor(secondsToTarget / 3600)} hours`;
    if (secondsToTarget < 31536000) return `${Math.floor(secondsToTarget / 86400)} days`;
    return `${Math.floor(secondsToTarget / 31536000)} years`;
  };

  const getCharsetSize = (pwd) => {
    let size = 0;
    if (/[a-z]/.test(pwd)) size += 26;
    if (/[A-Z]/.test(pwd)) size += 26;
    if (/\d/.test(pwd)) size += 10;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) size += 32;
    return size;
  };

  const analyzePassword = () => {
    if (!password) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /\d/.test(password),
        symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        common: !['password', '123456', 'qwerty', 'admin'].includes(password.toLowerCase())
      };

      const score = Object.values(checks).filter(Boolean).length;
      const strength = score <= 2 ? 'Weak' : score <= 4 ? 'Medium' : 'Strong';
      const color = score <= 2 ? 'text-red-500' : score <= 4 ? 'text-yellow-500' : 'text-green-500';

      setAnalysis({
        checks,
        score,
        strength,
        color,
        recommendations: getRecommendations(checks)
      });
      setIsAnalyzing(false);
    }, 500);
  };

  const getRecommendations = (checks) => {
    const recommendations = [];
    if (!checks.length) recommendations.push('Use at least 8 characters');
    if (!checks.uppercase) recommendations.push('Add uppercase letters (A-Z)');
    if (!checks.lowercase) recommendations.push('Add lowercase letters (a-z)');
    if (!checks.numbers) recommendations.push('Include numbers (0-9)');
    if (!checks.symbols) recommendations.push('Add special characters (!@#$%^&*)');
    if (!checks.common) recommendations.push('Avoid common passwords');
    return recommendations;
  };

  const CheckItem = ({ label, passed }) => (
    <motion.div
      className="flex items-center space-x-2 p-2 rounded-lg bg-card/50"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {passed ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className={`text-sm ${passed ? 'text-green-500' : 'text-red-500'}`}>
        {label}
      </span>
    </motion.div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center glow">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Password Security Suite</h1>
          <p className="text-muted-foreground">Comprehensive password analysis, generation, and security tools</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-card border border-border rounded-xl p-2 glass">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide [::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[
            { id: 'analyzer', label: 'Analyzer', icon: Shield },
            { id: 'generator', label: 'Generator', icon: Dices },
            { id: 'breach', label: 'Breach Check', icon: Database },
            { id: 'history', label: 'History', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer flex items-center space-x-2 px-5 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg glow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'analyzer' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key="analyzer"
        >
          {/* Password Input */}
          <div className="bg-card border border-border rounded-xl p-6 glass">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Enter Password to Analyze
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all glass"
                  placeholder="Enter your password here..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex space-x-3 ">
                <Button
                  onClick={analyzePassword}
                  variant="primary"
                  disabled={!password || isAnalyzing}
                  className="cursor-pointer flex-1 bg-primary hover:bg-primary/90 text-primary-foreground glow"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Analyze</span>
                    </div>
                  )}
                </Button>
                
                <Button
                  onClick={() => setActiveTab('breach')}
                  disabled={!password || isCheckingBreach}
                  variant="outline"
                  className="cursor-pointer flex items-center space-x-2"
                >
                  <Database className="w-4 h-4" />
                  <span>Breaches</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Strength Score with Crack Time */}
              <div className="bg-card border border-border rounded-xl p-6 glass">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-card-foreground">
                        Password Strength
                      </h3>
                      <div className={`text-2xl font-bold ${analysis.color}`}>
                        {analysis.strength}
                      </div>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-3 mb-2">
                      <motion.div
                        className={`h-3 rounded-full ${
                          analysis.score <= 2 ? 'bg-red-500' : 
                          analysis.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                        } glow`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(analysis.score / 6) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Score: {analysis.score}/6 security criteria met
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Timer className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-semibold text-card-foreground">Estimated Crack Time</p>
                      <p className="text-lg font-bold text-primary">{estimateCrackTime(password)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Checks */}
              <div className="bg-card border border-border rounded-xl p-6 glass">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">
                  Security Checks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <CheckItem label="At least 8 characters" passed={analysis.checks.length} />
                  <CheckItem label="Contains uppercase letters" passed={analysis.checks.uppercase} />
                  <CheckItem label="Contains lowercase letters" passed={analysis.checks.lowercase} />
                  <CheckItem label="Contains numbers" passed={analysis.checks.numbers} />
                  <CheckItem label="Contains special characters" passed={analysis.checks.symbols} />
                  <CheckItem label="Not a common password" passed={analysis.checks.common} />
                </div>
              </div>

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6 glass">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-green-700" />
                    <h3 className="text-lg font-semibold text-card-foreground">
                      Recommendations
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <motion.li
                        key={index}
                        className="flex items-center space-x-2 text-sm text-muted-foreground"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                        <span>{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Breach Check Results */}
          {breachResult && (
            <motion.div
              className="bg-card border border-border rounded-xl p-6 glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Database className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-card-foreground">
                  Breach Check Results
                </h3>
              </div>
              
              {breachResult.isBreached ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-red-500">
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">Password found in {breachResult.breaches.length} known breach(es)</span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">Breaches:</p>
                    <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                      {breachResult.breaches.map((breach, index) => (
                        <li key={index}>• {breach}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Password not found in known breaches</span>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-3">
                Checked on: {breachResult.checkedAt}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Password Generator Tab */}
      {activeTab === 'generator' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key="generator"
        >
          <div className="bg-gradient-to-br from-card via-card to-card/80 border border-border rounded-xl p-4 glass backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div>
                  <h3 className="text-xl font-bold text-card-foreground">Password Generator</h3>
                  <p className="text-xs text-muted-foreground">Create ultra-secure passwords with custom settings</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground whitespace-nowrap">
                <Zap className="w-4 h-4 text-primary" />
                <span>AI-Powered</span>
              </div>
            </div>
            
            {/* Generator Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Settings */}
              <div className="lg:col-span-2 space-y-6">
                {/* Password Length Slider */}
                <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-semibold text-card-foreground flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-primary" />
                      <span>Password Length</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary">{generatorSettings.length}</span>
                      <span className="text-sm text-muted-foreground">characters</span>
                    </div>
                  </div>
                  <div className="relative w-full">
                    <input
                      type="range"
                      min="4"
                      max="50"
                      value={generatorSettings.length}
                      onChange={(e) =>
                        setGeneratorSettings((prev) => ({
                          ...prev,
                          length: parseInt(e.target.value),
                        }))
                      }
                      className="w-full h-2 appearance-none rounded-lg bg-gradient-to-r from-primary to-muted cursor-pointer transition-all duration-300 focus:outline-none"
                      style={{
                        background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
                          ((generatorSettings.length - 4) / 46) * 100
                        }%, hsl(var(--muted)) ${
                          ((generatorSettings.length - 4) / 46) * 100
                        }%, hsl(var(--muted)) 100%)`,
                      }}
                    />

                    {/* Custom thumb using Tailwind + appearance-none */}
                    <style jsx>{`
                      input[type='range']::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        height: 20px;
                        width: 20px;
                        border-radius: 50%;
                        background: hsl(var(--primary));
                        box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2);
                        border: 2px solid var(--accent-foreground);
                        transition: background 0.3s ease;
                        cursor: pointer;
                      }
                      input[type='range']::-moz-range-thumb {
                        height: 20px;
                        width: 20px;
                        border-radius: 50%;
                        background: hsl(var(--primary));
                        box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2);
                        border: 2px solid white;
                        cursor: pointer;
                      }
                    `}</style>

                    {/* Labels */}
                    <div className="flex justify-between text-xs text-muted-foreground mt-3 px-1 font-medium">
                      <span>Weak</span>
                      <span>Medium</span>
                      <span>Strong</span>
                      <span>Ultra Secure</span>
                    </div>
                  </div>

                </div>

                {/* Character Type Options */}
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <h4 className="text-sm font-semibold text-card-foreground mb-4 flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-primary" />
                    <span>Character Types</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { 
                        key: 'includeUppercase', 
                        label: 'Uppercase Letters', 
                        example: 'A-Z',
                        color: 'text-blue-500'
                      },
                      { 
                        key: 'includeLowercase', 
                        label: 'Lowercase Letters', 
                        example: 'a-z',
                        color: 'text-green-500'
                      },
                      { 
                        key: 'includeNumbers', 
                        label: 'Numbers', 
                        example: '0-9',
                        color: 'text-purple-500'
                      },
                      { 
                        key: 'includeSymbols', 
                        label: 'Special Characters', 
                        example: '!@#$%',
                        color: 'text-orange-500'
                      }
                    ].map((option) => (
                      <motion.label 
                        key={option.key} 
                        className={`relative flex items-center space-x-3 p-3 rounded-xl border-1 cursor-pointer transition-all duration-300 hover:scale-100 ${
                          generatorSettings[option.key] 
                            ? 'border-primary bg-primary/10 shadow-lg glow' 
                            : 'border-border/10 bg-card/50 hover:border-primary/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={generatorSettings[option.key]}
                            onChange={(e) => setGeneratorSettings(prev => ({ 
                              ...prev, 
                              [option.key]: e.target.checked 
                            }))}
                            className="sr-only"
                          />
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                            generatorSettings[option.key]
                              ? 'border-primary bg-primary scale-100'
                              : 'border-muted-foreground/30 bg-transparent scale-90'
                          }`}>
                            {generatorSettings[option.key] && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <CheckCircle className="w-4 h-4 text-primary-foreground" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-card-foreground">{option.label}</span>
                          </div>
                          <span className={`text-xs ${option.color} font-mono`}>{option.example}</span>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <h4 className="text-sm font-semibold text-card-foreground mb-4 flex items-center space-x-2">
                    <Key className="w-4 h-4 text-primary" />
                    <span>Advanced Options</span>
                  </h4>
                  <motion.label 
                    className={`flex items-center justify-between p-3 rounded-xl border-1 cursor-pointer transition-all duration-300 ${
                      generatorSettings.excludeSimilar 
                        ? 'border-primary bg-primary/10 shadow-lg' 
                        : 'border-border/10 bg-card/50 hover:border-primary/50'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={generatorSettings.excludeSimilar}
                          onChange={(e) => setGeneratorSettings(prev => ({ 
                            ...prev, 
                            excludeSimilar: e.target.checked 
                          }))}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                          generatorSettings.excludeSimilar
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/30 bg-transparent'
                        }`}>
                          {generatorSettings.excludeSimilar && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <CheckCircle className="w-4 h-4 text-primary-foreground" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-card-foreground">Exclude Similar Characters</span>
                        <p className="text-xs text-muted-foreground">Avoid: i, l, 1, L, o, 0, O</p>
                      </div>
                    </div>
                    <span className="text-2xl">👁️</span>
                  </motion.label>
                </div>
              </div>
              
              {/* Right Column - Generation & Output */}
              <div className="space-y-6">
                {/* Generate Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={generatePassword}
                    className="cursor-pointer w-full h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold text-sm shadow-lg hover-lift glow"
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ rotate: generatedPassword ? 360 : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </motion.div>
                      <span>Generate Password</span>
                      <Zap className="w-4 h-4" />
                    </div>
                  </Button>
                </motion.div>
                
                {/* Generated Password Display */}
                {generatedPassword && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Password Output */}
                    <div className="bg-gradient-to-br from-card/20 to-card/80 border-2 border-primary/20 rounded-xl p-4 shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-card-foreground flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-primary" />
                          <span>Generated Password</span>
                        </span>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          getPasswordStrength(generatedPassword) === 'Strong' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          getPasswordStrength(generatedPassword) === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {getPasswordStrength(generatedPassword)}
                        </div>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="text"
                          value={generatedPassword}
                          readOnly
                          className="w-full px-2 py-8 bg-muted/50 border border-border/50 rounded-lg font-mono text-sm text-center top-1 tracking-wider selection:bg-primary/20 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <motion.button
                          onClick={() => copyToClipboard(generatedPassword)}
                          className="cursor-pointer absolute right-1 bottom-1 p-1 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Copy className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => {
                            copyToClipboard(generatedPassword);
                            // Add visual feedback here
                          }}
                          variant="outline"
                          className="cursor-pointer w-full bg-card/50 border-primary/30 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                        >
                          <div className="flex items-center space-x-2">
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </div>
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => {
                            setPassword(generatedPassword);
                            setActiveTab('analyzer');
                            // Auto-analyze after switching tabs
                            setTimeout(() => analyzePassword(), 100);
                          }}
                          variant="outline"
                          className="cursor-pointer w-full bg-card/50 border-primary/30 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                        >
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4" />
                            <span>Analyze</span>
                          </div>
                        </Button>
                      </motion.div>
                    </div>

                    {/* Password Stats */}
                    <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                      <h5 className="text-sm font-semibold text-card-foreground mb-3 flex items-center space-x-2">
                        <Timer className="w-4 h-4 text-primary" />
                        <span>Security Metrics</span>
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Length:</span>
                          <span className="font-mono text-primary">{generatedPassword.length} chars</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Charset Size:</span>
                          <span className="font-mono text-primary">{getCharsetSize(generatedPassword)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Crack Time:</span>
                          <span className="font-mono text-primary">{estimateCrackTime(generatedPassword)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entropy:</span>
                          <span className="font-mono text-primary">
                            {Math.round(Math.log2(Math.pow(getCharsetSize(generatedPassword), generatedPassword.length)))} bits
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick Presets */}
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <h5 className="text-sm font-semibold text-card-foreground mb-3 flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Quick Presets</span>
                  </h5>
                  <div className="space-y-2">
                    {[
                      { name: 'Basic', length: 8, settings: { includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: false, excludeSimilar: false } },
                      { name: 'Strong', length: 12, settings: { includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true, excludeSimilar: false } },
                      { name: 'Ultra', length: 16, settings: { includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true, excludeSimilar: true } }
                    ].map((preset) => (
                      <motion.button
                        key={preset.name}
                        onClick={() => setGeneratorSettings({ length: preset.length, ...preset.settings })}
                        className="w-full text-left px-3 py-2 rounded-lg bg-card/50 hover:bg-primary/10 border border-border/30 hover:border-primary/50 transition-all duration-200 text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-card-foreground">{preset.name}</span>
                          <span className="text-xs text-muted-foreground">{preset.length} chars</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Breach Checker Tab */}
      {activeTab === 'breach' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key="breach"
        >
          <div className="bg-card border border-border rounded-xl p-6 glass">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Data Breach Checker
            </h3>
            <p className="text-muted-foreground mb-6">
              Check if your password has been pwned in known data breaches.
            </p>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all glass"
                  placeholder="Enter password to check..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                onClick={checkForBreaches}
                disabled={!password || isCheckingBreach}
                className="cursor-pointer w-full bg-primary hover:bg-primary/90 text-primary-foreground hover-lift glow"
              >
                {isCheckingBreach ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Checking Breaches...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Check for Breaches</span>
                  </div>
                )}
              </Button>
            </div>

            {breachResult && (
              breachResult.error ? (
                <div className="inline-flex intems-center space-x-2 mt-6">
                  <XCircle className="w-6 h-6" />
                  <span className="text-lg font-semibold">{breachResult.error}</span>
                </div>
              ) : (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {breachResult.isBreached ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-red-500">
                      <XCircle className="w-6 h-6" />
                      <span className="text-lg font-semibold">Password Compromised!</span>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-red-700 dark:text-red-300 mb-3">
                        This password was found in <strong>{breachResult.breaches} known data breaches</strong>...
                      </p>
                      <p className="text-red-700 dark:text-red-300 mt-3 font-semibold">
                        <AlertTriangle className="inline-block text-yellow-200 w-4 h-4 mr-2 relative -top-[2px]" />
                        Change this password immediately!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-green-500">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                      <span className="text-lg font-semibold">Password is Safe!</span>
                      <p className="text-green-600 dark:text-green-400 text-sm">
                        This password was not found in any known data breaches.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Password History Tab */}
      {activeTab === 'history' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key="history"
        >
          <div className="bg-card border border-border rounded-xl p-6 glass">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">
                Generated Password History
              </h3>
              <Button
                onClick={() => setPasswordHistory([])}
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={passwordHistory.length === 0}
              >
                Clear History
              </Button>
            </div>
            
            {passwordHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No generated passwords yet</p>
                <p className="text-sm">Generate passwords to see them here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {passwordHistory.map((entry, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-1">
                      <div className="font-mono text-sm">{entry.password}</div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span>{entry.timestamp}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.strength === 'Strong' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
                          entry.strength === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {entry.strength}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(entry.password)}
                      className="cursor-pointer p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Security Tips */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">
            Advanced Security Tips
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
          <div className="space-y-2">
            <h4 className="font-semibold text-card-foreground flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Password Best Practices</span>
            </h4>
            <p>• Use unique passwords for each account</p>
            <p>• Enable two-factor authentication</p>
            <p>• Consider using passphrases</p>
            <p>• Avoid personal information</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-card-foreground flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>Password Managers</span>
            </h4>
            <p>• Use a reputable password manager</p>
            <p>• Generate strong, unique passwords</p>
            <p>• Secure your master password</p>
            <p>• Enable auto-fill for convenience</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-card-foreground flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Regular Maintenance</span>
            </h4>
            <p>• Check for breaches regularly</p>
            <p>• Update compromised passwords</p>
            <p>• Review account security settings</p>
            <p>• Monitor for suspicious activity</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PasswordChecker;


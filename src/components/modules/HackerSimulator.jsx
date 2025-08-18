/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: HackerSimulator.jsx
 */

/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Terminal, Shield, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HackerSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [selectedAttack, setSelectedAttack] = useState('phishing');

  const attackScenarios = {
    phishing: {
      name: 'Phishing Email Attack',
      description: 'Simulate a phishing email campaign targeting user credentials',
      steps: [
        'Scanning for email addresses...',
        'Crafting convincing phishing email...',
        'Setting up fake login page...',
        'Sending phishing emails...',
        'Monitoring for credential submissions...',
        'Attack simulation complete!'
      ],
      vulnerability: 'Social Engineering',
      severity: 'High'
    },
    bruteforce: {
      name: 'Brute Force Attack',
      description: 'Attempt to crack passwords using automated tools',
      steps: [
        'Identifying target login page...',
        'Loading password dictionary...',
        'Starting brute force attempts...',
        'Testing common passwords...',
        'Analyzing response patterns...',
        'Attack simulation complete!'
      ],
      vulnerability: 'Weak Passwords',
      severity: 'Medium'
    },
    malware: {
      name: 'Malware Injection',
      description: 'Simulate malware deployment and system compromise',
      steps: [
        'Scanning for system vulnerabilities...',
        'Preparing malware payload...',
        'Exploiting security weakness...',
        'Establishing persistence...',
        'Exfiltrating system information...',
        'Attack simulation complete!'
      ],
      vulnerability: 'Unpatched Software',
      severity: 'Critical'
    }
  };

  const runSimulation = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    setCurrentStep(0);
    setLogs([]);

    const scenario = attackScenarios[selectedAttack];
    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex < scenario.steps.length) {
        const newLog = {
          id: Date.now() + stepIndex,
          message: scenario.steps[stepIndex],
          timestamp: new Date().toLocaleTimeString(),
          type: stepIndex === scenario.steps.length - 1 ? 'success' : 'info'
        };
        
        setLogs(prev => [...prev, newLog]);
        setCurrentStep(stepIndex + 1);
        stepIndex++;
      } else {
        setIsRunning(false);
        clearInterval(interval);
      }
    }, 2000);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setLogs([]);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-red-500 bg-red-500/10';
      case 'High': return 'text-orange-500 bg-orange-500/10';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center glow">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hacker Simulator</h1>
          <p className="text-muted-foreground">Experience simulated cyber attacks safely</p>
        </div>
      </div>
      <motion.div
        className="bg-card border border-border rounded-xl p-6 glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold text-card-foreground mb-4">
          Select Attack Scenario
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(attackScenarios).map(([key, scenario]) => (
            <motion.div
              key={key}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover-lift ${
                selectedAttack === key 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card/50'
              }`}
              onClick={() => setSelectedAttack(key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-card-foreground">{scenario.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(scenario.severity)}`}>
                  {scenario.severity}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{scenario.description}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                Target: {scenario.vulnerability}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Simulation Controls */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">
            Simulation Controls
          </h3>
          <div className="flex space-x-2">
            <Button
              onClick={runSimulation}
              disabled={!selectedAttack}
              className={`cursor-pointer ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'} hover-lift glow`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button
              onClick={resetSimulation}
              variant="outline"
              className="cursor-pointer hover-lift"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {selectedAttack && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{currentStep}/{attackScenarios[selectedAttack].steps.length}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full glow"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / attackScenarios[selectedAttack].steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Terminal Output */}
      <motion.div
        className="bg-card border border-border rounded-xl overflow-hidden glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center space-x-2 p-4 border-b border-border bg-muted/20">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-card-foreground">Simulation Terminal</span>
          <div className="flex space-x-1 ml-auto">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="p-4 h-64 overflow-y-auto bg-black/20 font-mono text-sm">
          <AnimatePresence>
            {logs.length === 0 ? (
              <div className="text-muted-foreground">
                Select an attack scenario and click "Start" to begin simulation...
              </div>
            ) : (
              logs.map((log) => (
                <motion.div
                  key={log.id}
                  className={`mb-2 ${log.type === 'success' ? 'text-green-400' : 'text-green-300'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-muted-foreground">[{log.timestamp}]</span> {log.message}
                  {isRunning && logs.indexOf(log) === logs.length - 1 && (
                    <motion.span
                      className="inline-block w-2 h-4 bg-green-400 ml-1"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Security Insights */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-card-foreground">
            Security Insights
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-card-foreground">Protection Strategies:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Use strong, unique passwords</li>
              <li>• Enable two-factor authentication</li>
              <li>• Keep software updated</li>
              <li>• Be cautious with email attachments</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-card-foreground">Warning Signs:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Unexpected login attempts</li>
              <li>• Suspicious email requests</li>
              <li>• Slow system performance</li>
              <li>• Unknown network activity</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HackerSimulator;


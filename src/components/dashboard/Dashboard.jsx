/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: Dashboard.jsx
 */

import React, { use, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  Lock,
  Zap,
  Ghost,
  Gamepad2,
  UserX,
  Eye,
  Link,
  Newspaper,
  TrendingUp,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CyberNewsCard from './CyberNewsCard';
import ModuleCard from './ModuleCard';


const Dashboard = () => {
  const [loadingModules, setLoadingModules] = useState({});
  const navigate = useNavigate();

  const modules = [
    {
      id: 'cyren',
      title: 'Cyren AI',
      description: 'AI-powered cybersecurity assistant.',
      icon: (() => <img src="/icon.svg" alt="Cyren AI" />),
      status: 'active',
      lastUsed: 'GPT-4' // '1 hour ago'
    },
    {
      id: 'password-checker',
      title: 'Password Utilities',
      description: 'Analyze password, generate strong passwords and check for password leaked in data breaches.',
      icon: Lock,
      status: 'active',
      lastUsed: 'Not measured' // '2 hours ago'
    },
    {
      id: 'fake-profile',
      title: 'Fake Profile Analyzer',
      description: 'Detect fake social media profiles and suspicious accounts.',
      icon: UserX,
      status: 'active',
      lastUsed: 'Not measured' // 'Never used'
    },
    {
      id: 'url-scanner',
      title: 'Site Scanner',
      description: 'Analyze and scan URLs for security vulnerabilities.',
      icon: Link,
      status: 'active',
      lastUsed: 'Not measured' // '5 hours ago'
    },
    {
      id: 'vault',
      title: 'Password Vault',
      description: 'Securely store and manage your passwords.',
      icon: Shield,
      status: 'active',
      lastUsed: 'Not measured' // '10 minutes ago'
    },
    {
      id: 'hacker-simulator',
      title: 'Hacker Simulator',
      description: 'Experience simulated cyber attacks to understand vulnerabilities.',
      icon: Zap,
      status: 'warning',
      lastUsed: 'Not measured' // '1 day ago'
    },
    {
      id: 'cybercrimes-tracker',
      title: 'Cybercrime Tracker',
      description: 'Monitor and analyze cybercrime activities in real-time.',
      icon: Eye,
      status: 'active',
      lastUsed: 'Not measured' // '5 hours ago'
    },
    {
      id: 'ghost-mode',
      title: 'Ghost Mode',
      description: 'Browse anonymously and protect your digital footprint.',
      icon: Ghost,
      status: 'active',
      lastUsed: 'Not measured' // '30 minutes ago'
    },
    {
      id: 'scam-buster',
      title: 'Scam Buster Game',
      description: 'Interactive game to learn how to identify and avoid online scams.',
      icon: Gamepad2,
      status: 'active',
      lastUsed: 'Not measured' // '3 hours ago'
    },
    {
      id: 'news-feed',
      title: 'Cyber News',
      description: 'Stay updated with the latest cybersecurity threats and news.',
      icon: Newspaper,
      status: 'active',
      lastUsed: 'Not measured' // '1 hour ago'
    }
  ];

  const handleModuleClick = (moduleId) => {
    setLoadingModules(prev => ({ ...prev, [moduleId]: true }));
    setTimeout(() => {
      setLoadingModules(prev => ({ ...prev, [moduleId]: false }));
      navigate(`/${moduleId}`);
    }, 500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Privacy-focused Apps Data
  const privacyApps = [
    {
      name: "Brave Browser",
      purpose: "Private Web Browser",
      icon: "🦁",
      link: "https://brave.com/"
    },
    {
      name: "DuckDuckGo",
      purpose: "Private Search Engine",
      icon: "🦆",
      link: "https://duckduckgo.com/"
    },
    {
      name: "Signal",
      purpose: "Secure Messaging",
      icon: "📱",
      link: "https://signal.org/"
    },
    {
      name: "ProtonMail",
      purpose: "Encrypted Email",
      icon: "✉️",
      link: "https://proton.me/mail"
    },
    {
      name: "Tor Browser",
      purpose: "Anonymous Browsing",
      icon: "🧅",
      link: "https://www.torproject.org/"
    },
    {
      name: "Bitwarden",
      purpose: "Password Manager",
      icon: "🔑",
      link: "https://bitwarden.com/"
    },
    {
      name: "SimpleLogin",
      purpose: "Email Alias Service",
      icon: "📬",
      link: "https://simplelogin.io/"
    },
    {
      name: "Mullvad VPN",
      purpose: "Private VPN",
      icon: "🛡️",
      link: "https://mullvad.net/"
    }
  ];

  return (
    <motion.div
      className="space-y-8 scroll-smooth"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-accent-foreground mb-2 tracking-tight">
          Cyren's Security Suite
        </h1>
        <p className="text-accent-foreground text-lg">
          Cognitive Yielder of Risk Evaluation & Neutralization
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <CyberNewsCard />
      </motion.div>

      {/* Security Modules Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Security Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              title={module.title}
              description={module.description}
              icon={module.icon}
              status={module.status}
              lastUsed={module.lastUsed}
              isLoading={loadingModules[module.id]}
              onClick={() => handleModuleClick(module.id)}
            />
          ))}
        </div>
      </motion.div>
      <motion.div
        className="bg-card/50 border border-border/50 rounded-xl p-6 glass-effect backdrop-blur-sm"
        variants={itemVariants}
      >
        <h3 className="text-xl font-semibold text-card-foreground mb-6">
          Recommended Privacy Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {privacyApps.map((app, index) => (
            <motion.a
              key={app.name}
              href={app.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center md:flex-col md:items-center md:justify-center p-4 bg-background/40 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 hover:bg-primary/5 border border-transparent hover:border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="mr-4 md:mr-0 md:mb-3">
                <img
                  src={`https://icon.horse/icon/${new URL(app.link).hostname}`}
                  alt={`${app.name} logo`}
                  className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-125 group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                />
              </div>
              <div className="text-left md:text-center z-10">
                <div className="font-semibold text-card-foreground">{app.name}</div>
                <div className="text-sm text-muted-foreground">{app.purpose}</div>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;


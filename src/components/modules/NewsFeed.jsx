/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: NewsFeed.jsx
 */

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Clock, 
  ExternalLink,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock news data
  const mockNews = [
    {
      id: 1,
      title: 'Critical Zero-Day Vulnerability Found in Popular Web Framework',
      summary: 'Security researchers have discovered a critical vulnerability that affects millions of websites worldwide.',
      category: 'vulnerability',
      severity: 'critical',
      timestamp: '2 hours ago',
      source: 'CyberSec Daily',
      readTime: '3 min read'
    },
    {
      id: 2,
      title: 'New Phishing Campaign Targets Banking Customers',
      summary: 'Cybercriminals are using sophisticated social engineering tactics to steal banking credentials.',
      category: 'threat',
      severity: 'high',
      timestamp: '4 hours ago',
      source: 'Security Alert',
      readTime: '2 min read'
    },
    {
      id: 3,
      title: 'AI-Powered Security Tools Show 40% Improvement in Threat Detection',
      summary: 'Latest research shows significant advancement in machine learning-based cybersecurity solutions.',
      category: 'technology',
      severity: 'info',
      timestamp: '6 hours ago',
      source: 'Tech Security',
      readTime: '5 min read'
    },
    {
      id: 4,
      title: 'Major Data Breach Affects 2 Million Users',
      summary: 'A leading social media platform reports unauthorized access to user data including personal information.',
      category: 'breach',
      severity: 'high',
      timestamp: '8 hours ago',
      source: 'Breach Monitor',
      readTime: '4 min read'
    },
    {
      id: 5,
      title: 'New Ransomware Strain Targets Healthcare Institutions',
      summary: 'Healthcare organizations are being targeted by a new variant of ransomware with advanced encryption.',
      category: 'malware',
      severity: 'critical',
      timestamp: '12 hours ago',
      source: 'Healthcare Security',
      readTime: '6 min read'
    },
    {
      id: 6,
      title: 'Government Issues New Cybersecurity Guidelines for Small Businesses',
      summary: 'Updated recommendations help small businesses protect against common cyber threats.',
      category: 'policy',
      severity: 'info',
      timestamp: '1 day ago',
      source: 'Gov Security',
      readTime: '4 min read'
    }
  ];

  const categories = [
    { id: 'all', label: 'All News', icon: Newspaper },
    { id: 'vulnerability', label: 'Vulnerabilities', icon: AlertTriangle },
    { id: 'threat', label: 'Threats', icon: Shield },
    { id: 'breach', label: 'Data Breaches', icon: AlertTriangle },
    { id: 'malware', label: 'Malware', icon: AlertTriangle },
    { id: 'technology', label: 'Technology', icon: TrendingUp },
    { id: 'policy', label: 'Policy', icon: Shield }
  ];

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [news, selectedCategory, searchTerm]);

  const loadNews = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setNews(mockNews);
      setIsLoading(false);
    }, 1000);
  };

  const filterNews = () => {
    let filtered = news;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredNews(filtered);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const NewsCard = ({ article }) => (
    <motion.div
      className="bg-card border border-border rounded-xl p-6 glass hover-lift cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      layout
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(article.severity)}`}>
          {article.severity.toUpperCase()}
        </span>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{article.timestamp}</span>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-2">
        {article.title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {article.summary}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <span>{article.source}</span>
          <span>{article.readTime}</span>
        </div>
        <Button variant="ghost" size="sm" className="p-1">
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center glow">
            <Newspaper className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cyber News Feed</h1>
            <p className="text-muted-foreground">Stay updated with latest cybersecurity threats and news</p>
          </div>
        </div>
        
        <Button
          onClick={loadNews}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground hover-lift glow"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters and Search */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all glass"
                placeholder="Search news..."
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  className={`flex items-center space-x-1 whitespace-nowrap ${
                    selectedCategory === category.id ? 'glow' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="w-3 h-3" />
                  <span>{category.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                className="bg-card border border-border rounded-xl p-6 glass"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="animate-pulse">
                  <div className="flex justify-between mb-3">
                    <div className="w-16 h-6 bg-muted rounded"></div>
                    <div className="w-20 h-4 bg-muted rounded"></div>
                  </div>
                  <div className="w-full h-6 bg-muted rounded mb-2"></div>
                  <div className="w-3/4 h-6 bg-muted rounded mb-4"></div>
                  <div className="w-full h-4 bg-muted rounded mb-2"></div>
                  <div className="w-2/3 h-4 bg-muted rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="w-24 h-4 bg-muted rounded"></div>
                    <div className="w-8 h-8 bg-muted rounded"></div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : filteredNews.length > 0 ? (
            filteredNews.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))
          ) : (
            <motion.div
              className="col-span-full text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No news articles found matching your criteria.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Stats */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-card-foreground mb-4">
          Today's Security Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">2</div>
            <div className="text-xs text-muted-foreground">Critical Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">5</div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">12</div>
            <div className="text-xs text-muted-foreground">New Articles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">98%</div>
            <div className="text-xs text-muted-foreground">System Health</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NewsFeed;


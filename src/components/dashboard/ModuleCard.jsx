/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: ModuleCard.jsx
 */

import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ModuleCard = ({ 
  title, 
  description, 
  icon: Icon, 
  status = 'active',
  lastUsed,
  onClick,
  isLoading = false 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'inactive':
        return 'text-gray-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <motion.div
      className={`bg-card glass ${title === 'Cyren AI' ? 'neon-border' : 'border border-border'} rounded-xl p-6 hover-lift cursor-pointer group`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center glow group-hover:bg-primary/20 transition-colors`}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} glow`} />
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{lastUsed || 'Never used'}</span>
        </div>
        
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity p-1"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-xl flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ModuleCard;

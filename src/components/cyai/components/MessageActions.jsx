/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: MessageActions.jsx
 */

import React, { useState } from 'react';
import { Copy, Check, RotateCcw, MoreHorizontal, Download, Share2 } from 'lucide-react';

const MessageActions = ({ message, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadAsText = () => {
    const blob = new Blob([message.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-response-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const shareMessage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cyren\'s Response',
          text: message.content,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying to clipboard
      copyToClipboard();
    }
    setShowMenu(false);
  };

  return (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={copyToClipboard}
        className="cursor-pointer p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        title="Copy message"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
      
      <button
        disabled
        onClick={() => onRegenerate(message.id)}
        className="cursor-pointer p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        title="Regenerate response"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={downloadAsText}
        className="cursor-pointer p-1.5 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Download className="w-4 h-4" />
      </button>
      <button
        onClick={shareMessage}
        className="cursor-pointer p-1.5 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default MessageActions;


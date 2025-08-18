/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: CyberNewsCard.jsx
 */

import React, { use } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ExternalLink, Globe } from 'lucide-react';

const CyberNewsCard = () => {
  const [news, setNews] = React.useState({
    title: "Loading title...",
    description: "Loading description...",
    imageUrl: "/fetching.png",
    source: "Loading source...",
    publishedAt: "Loading date...",
    link: "/dashboard"
  });

  const { title, description, imageUrl, source, publishedAt, link } = news;
  const formattedDate = new Date(publishedAt).toLocaleString();

  React.useEffect(() => {
    fetch('/api/news')
      .then(response => response.json())
      .then(data => {
        setNews(data);
      });
  }, []);

  return (
    <motion.div
      className="w-full bg-card rounded-xl p-4 glass hover-lift"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full">
        {/* Thumbnail */}
        <img
          src={imageUrl}
          alt="News Thumbnail"
          className="w-full md:w-100 h-40 object-cover -m-4 rounded-l-xl"
        />

        {/* Content */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-card-foreground line-clamp-1">{title}</h2>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{description}</p>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground gap-2">
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              Source: <strong className="ml-1">{source}</strong>
            </span>
            <span>{formattedDate}</span>
          </div>

          <div className="mt-4">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:underline text-sm"
            >
              Read full article <ExternalLink className="ml-1 w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CyberNewsCard;

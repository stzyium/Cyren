/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: GhostMode.jsx
 */

import {useState, useEffect} from 'react';
import { useLayout } from '../../contexts/LayoutContext';

const GoogleSearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-full px-4 py-1 shadow-md  w-full max-w-md"
    >
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search Google..."
        className="flex-1 px-2 py-1 text-accent-foreground placeholder-gray-500 outline-none"
      />
      <button
        type="submit"
        className="cursor-pointer font-semibold hover:text-blue-700"
      >
        🔍
      </button>
    </form>
  );
};

const GhostMode = () => {
    const { setShowGreeting, setTopBarContent } = useLayout();
    const [url, setUrl] = useState('https://google.com');

    function WebView({ url }) {
      return (
        <iframe
          src={url}
          title="WebView"
          style={{
            width: '100%',
            height: '100vh',
            border: 'none',
          }}
        />
      );
    }
    
    useEffect(() => {
      setShowGreeting(false);
      setTopBarContent(
        <GoogleSearchBar
          onSearch={query => {
            const isValidUrl = (str) => {
              try {
                new URL(str);
                return true;
              } catch (_) {
                return false;
              }
            };

            const input = query.trim();

            const finalUrl = isValidUrl(input)
              ? `https://www.google.com/search?q=${input}`
              : `https://www.google.com/search?q=${input}`;
            console.log(`Navigating to: ${finalUrl}`);
            setUrl(finalUrl);
          }}
        />
      );
      return () => {setTopBarContent(null), setShowGreeting(true)};
    }, [setTopBarContent, setShowGreeting]);

    return (
        <div className="-m-4 lg:-m-6">
            <WebView url={url} />
        </div>
    );
}
export default GhostMode;
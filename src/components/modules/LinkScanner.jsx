/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: LinkScanner.jsx
 */

import { useEffect } from 'react';
import { useLayout } from '../../contexts/LayoutContext';
export default function CyberUrlScanner() {
  const { setShowGreeting, setTopBarContent } = useLayout();

  useEffect(() => {
    setShowGreeting(false);
    setTopBarContent(
      <div className="flex items-center space-x-2">
        <div className="lg:text-xl text-sm">Powered by <a href="https://CyScan.io" className="text-green-500 hover:underline">CyScan.io</a></div>
      </div>
    );
    const script = document.createElement('script');
    script.src = '/sc12script.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      setTopBarContent(null);
      setShowGreeting(true);
    };
  }, []);


  return (
    <div className="-m-4 lg:-m-6 bg-gray-900/60 text-green-400 min-h-screen">
      <div className="matrix-bg fixed inset-0 pointer-events-none z-[-1] opacity-7"></div>

      <div className="flex flex-col min-h-screen relative">
        <header className="p-4 border-b border-green-500 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="text-2xl font-mono tracking-tighter">
              <span className="sr-only">Cyber URL Scanner - </span>
              Cyren's<span className="text-red-500"> URL </span>Scanner
            </h1>
          </div>
          <nav aria-label="Main Navigation">
            <ul className="flex space-x-4">
              <li><a href="#about" className="hover:text-green-300 transition">About</a></li>
              <li><a href="#features" className="hover:text-green-300 transition">Features</a></li>
            </ul>
          </nav>
        </header>

        <main className="flex-1 p-4 overflow-auto">
          <div id="scanner-tab" className="space-y-6">
            <div className="p-6 rounded-lg bg-gray-800/50 shadow-lg">
              <h2 className="text-xl font-mono mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                URL Scanner
              </h2>
              <form id="scan-form" className="mb-6" onSubmit={(e) => { e.preventDefault(); window.directScan(); }}>
                <div className="relative">
                  <input
                    type="url"
                    id="url-input"
                    placeholder="https://example.com"
                    className="w-full p-3 pr-12 rounded-4xl font-mono text-base border bg-gray-900/50 border-gray-700 text-gray-200"
                    required
                  />
                  <button
                    type="submit"
                    id="scan-button"
                    className="cursor-pointer absolute right-1 top-1 bottom-1 px-3 rounded-full bg-green-600/70 hover:bg-green-700 text-white transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
              <div id="scanner-console" className="p-4 rounded-2xl bg-black text-green-400 font-mono text-sm h-32 overflow-auto transition-all duration-300">
                <div className="flex items-center mb-2">
                  <span className="text-gray-500 mr-2">$</span>
                  <span className="typing-animation">cyberscan --url example.com --depth full --output json</span>
                </div>
                <div id="console-output" className="mt-2 scanner-text" />
              </div>
              <div id="scan-results" className="hidden p-6animate-fadeIn" />
            </div>
          </div>
        </main>

        <section id="about" className="p-6 bg-gray-800/50 m-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-green-400">About</h2>
                <div className="text-gray-300 space-y-4">
                    <p>Cyber URL Scanner is an advanced tool for analyzing website security. Using the latest cybersecurity technologies, we offer comprehensive URL scanning to detect potential threats.</p>
                    <p>Our tool was created by cybersecurity experts to provide users with the ability to check website security before visiting them. In the face of growing online threats, Cyber URL Scanner serves as the first line of defense against malware, phishing, and other cyberattacks.</p>
                    <p>Scanning takes place in real time, providing immediate results and detailed security analysis of the tested site. With an intuitive interface, the tool is accessible to both IT professionals and ordinary internet users.</p>
                </div>
        </section>

        <section id="features" className="p-6 bg-gray-800/50 m-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-green-400">Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-700/70 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-green-300">Malware Analysis</h3>
                <p className="text-gray-300">Detection of malicious code, scripts, and infections on the scanned site that may threaten user security.</p>
            </div>
            <div className="bg-gray-700/70 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-green-300">Phishing Detection</h3>
                <p className="text-gray-300">Identification of sites impersonating known services to extract personal or financial data.</p>
            </div>
            <div className="bg-gray-700/70 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-green-300">Tracking Scripts Analysis</h3>
                <p className="text-gray-300">Detection of user tracking technologies, analytical scripts, and other elements monitoring online activity.</p>
            </div>
            <div className="bg-gray-700/70 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-green-300">Vulnerability Scanning</h3>
                <p className="text-gray-300">Identification of potential security vulnerabilities that can be exploited by attackers for unauthorized access.</p>
            </div>
            <div className="bg-gray-700/70 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-green-300">Path Fuzzing</h3>
                <p className="text-gray-300">Automatic testing of popular URL paths to detect hidden admin panels, login pages, and other sensitive access points.</p>
            </div>
            <div className="bg-gray-700/70 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-green-300">Detailed Reports</h3>
                <p className="text-gray-300">Generation of comprehensive scan reports containing detailed information about detected threats and security recommendations.</p>
            </div>
          </div>
        </section>

        <footer className="bg-gray-800/50 border-t border-green-500 p-6 text-center text-gray-400">
          <div className="max-w-6xl mx-auto">
            <div className="pt-2 border-gray-700 text-sm">
              <p>&copy; 2025 CyScan.io. All rights reserved.</p>
            </div>
          </div>
        </footer>

        <div id="notifications" className="fixed bottom-4 right-4 space-y-2 z-50" />
      </div>
    </div>
  );
}

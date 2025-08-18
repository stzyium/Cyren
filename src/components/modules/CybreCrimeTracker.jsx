/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: CybreCrimeTracker.jsx
 */

import {useState} from 'react';

const CybercrimesTracker = () => {
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
    // eslint-disable-next-line no-unused-vars
    const [url, setUrl] = useState('https://cybercrime-tracker.net/');


    return (
        <div className="-m-4 lg:-m-6">
            <WebView url={url} />
        </div>
    );
}
export default CybercrimesTracker;
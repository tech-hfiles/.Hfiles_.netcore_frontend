'use client';

import Script from 'next/script';
import React from 'react';

export default function ScriptLoader() {
  return (
    <Script
      src="/js/indexscript.js"
      strategy="afterInteractive"
      onLoad={() => console.log('indexscript.js loaded')}
    />
  );
}

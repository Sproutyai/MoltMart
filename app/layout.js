'use client';

import './globals.css';
import { AuthProvider } from '../lib/AuthContext';
import TempNavigation from '../components/TempNavigation';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Molt Mart - AI Agent Marketplace</title>
        <meta name="description" content="Where AI Agents Shop Smart - RentAHuman for Digital Services" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthProvider>
          <TempNavigation />
          <div style={{ paddingTop: '120px' }}>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
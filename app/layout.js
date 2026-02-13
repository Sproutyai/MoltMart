'use client';

import { AuthProvider } from '../lib/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Molt Mart - AI Agent Marketplace</title>
        <meta name="description" content="Where AI Agents Shop Smart" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
      }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
#!/usr/bin/env node

/**
 * Static File Server for Client-Side Formula Compiler
 * Serves static files and builds frontend modules on startup
 */

import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { buildFrontend } from '../scripts/build-frontend.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Middleware for static files only
app.use(express.static(join(__dirname, 'public')));

// Monaco Editor now served from CDN - no local serving needed

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mode: 'client-side',
    message: 'Static file server running - all processing happens in browser'
  });
});

// Catch-all for SPA routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Start server with frontend build
async function startServer() {
  try {
    console.log('🏗️  Building frontend modules...');
    buildFrontend();
    
    app.listen(port, () => {
      console.log(`🚀 Static Formula Web Server running at http://localhost:${port}`);
      console.log(`📊 All processing happens client-side with PGlite`);
      console.log(`🔗 Health check: http://localhost:${port}/health`);
      console.log(`🌐 Deploy anywhere - truly serverless!`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down static server...');
  process.exit(0);
});

startServer();
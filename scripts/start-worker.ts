#!/usr/bin/env ts-node
/**
 * Script to start the audiobook generation worker
 * Run this in a separate process: npm run worker
 * Or use: ts-node scripts/start-worker.ts
 */

import "../lib/workers/audiobook-worker"
